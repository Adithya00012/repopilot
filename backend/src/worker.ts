import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "./queue";
import prisma from "./prisma";

const worker = new Worker(
    "issue-processing",
    async (job) => {
        const { action, issue, repository } = job.data;

        if (action !== "opened" && action !== "edited") {
            console.log(`Skipping action: ${action}`);
            return;
        }

        await prisma.issue.upsert({
            where: { githubId: BigInt(issue.id) },
            update: {
                title: issue.title,
                body: issue.body,
                state: issue.state,
                updatedAt: new Date(issue.updated_at),
            },
            create: {
                githubId: BigInt(issue.id),
                number: issue.number,
                title: issue.title,
                body: issue.body,
                state: issue.state,
                repo: repository.full_name,
                author: issue.user.login,
                createdAt: new Date(issue.created_at),
                updatedAt: new Date(issue.updated_at),
            },
        });

        console.log(`Processed issue #${issue.number}: ${issue.title}`);
    },
    { connection }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} failed:`, err.message);
});

console.log("Worker started, listening for jobs...");