import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import prisma from "./prisma";
import { categorizeIssue, draftResponse, checkCompleteness, generateReleaseSummary } from "./ai";

const server = new McpServer({
    name: "repopilot-mcp",
    version: "1.0.0",
});

server.registerTool(
    "search_issues",
    {
        description: "Search issues by title or state (open/closed)",
        inputSchema: {
            query: z.string().optional(),
            state: z.enum(["open", "closed"]).optional(),
        },
    },
    async ({ query, state }) => {
        const issues = await prisma.issue.findMany({
            where: {
                ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
                ...(state ? { state } : {}),
            },
            take: 10,
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        issues.map((i) => ({ id: i.id, number: i.number, title: i.title, state: i.state })),
                        null,
                        2
                    ),
                },
            ],
        };
    }
);

server.registerTool(
    "get_issue_context",
    {
        description: "Get full details of an issue including similar/duplicate issues",
        inputSchema: {
            id: z.number(),
        },
    },
    async ({ id }) => {
        const issue = await prisma.issue.findUnique({ where: { id } });

        if (!issue) {
            return { content: [{ type: "text", text: "Issue not found" }] };
        }

        const similar: any = await prisma.$queryRawUnsafe(
            `SELECT id, number, title, 1 - (embedding <=> (SELECT embedding FROM "Issue" WHERE id = $1)) AS similarity
       FROM "Issue"
       WHERE id != $1 AND embedding IS NOT NULL
       ORDER BY embedding <=> (SELECT embedding FROM "Issue" WHERE id = $1)
       LIMIT 3`,
            id
        );

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        {
                            issue: {
                                id: issue.id,
                                number: issue.number,
                                title: issue.title,
                                body: issue.body,
                                state: issue.state,
                                label: issue.label,
                                author: issue.author,
                            },
                            similarIssues: similar,
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    }
);

server.registerTool(
    "suggest_labels",
    {
        description: "Suggest a category label for an issue using AI (Bug, Feature Request, Documentation, Security, Question)",
        inputSchema: {
            id: z.number(),
        },
    },
    async ({ id }) => {
        const issue = await prisma.issue.findUnique({ where: { id } });

        if (!issue) {
            return { content: [{ type: "text", text: "Issue not found" }] };
        }

        const suggestedLabel = await categorizeIssue(issue.title, issue.body || "");

        return {
            content: [{ type: "text", text: JSON.stringify({ id, suggestedLabel }) }],
        };
    }
);

server.registerTool(
    "draft_comment",
    {
        description: "Draft a polite reply comment for an issue based on its completeness",
        inputSchema: {
            id: z.number(),
        },
    },
    async ({ id }) => {
        const issue = await prisma.issue.findUnique({ where: { id } });

        if (!issue) {
            return { content: [{ type: "text", text: "Issue not found" }] };
        }

        const completeness = await checkCompleteness(issue.title, issue.body || "");
        const draft = await draftResponse(issue.title, issue.body || "", completeness.complete, completeness.reason);

        return {
            content: [{ type: "text", text: JSON.stringify({ id, draft }) }],
        };
    }
);

server.registerTool(
    "create_release_summary",
    {
        description: "Generate AI-written release notes from all closed issues",
        inputSchema: {},
    },
    async () => {
        const closedIssues = await prisma.issue.findMany({
            where: { state: "closed" },
            orderBy: { updatedAt: "desc" },
        });

        const issuesList = closedIssues
            .map((i) => `#${i.number}: ${i.title} (${i.label || "uncategorized"})`)
            .join("\n");

        const summary = await generateReleaseSummary(issuesList || "No closed issues this period.");

        return {
            content: [{ type: "text", text: summary || "" }],
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("RepoPilot MCP server running on stdio");
}

main();