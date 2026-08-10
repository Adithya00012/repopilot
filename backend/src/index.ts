import express from "express";
import cors from "cors";
import "dotenv/config";
import axios from "axios";
import prisma from "./prisma";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 4000;

app.use(cors());

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

app.get("/", (req, res) => {
    res.send("Hello API");
});

app.get("/auth/github", (req, res) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user`;
    res.redirect(redirectUrl);
});

app.get("/auth/github/callback", async (req, res) => {
    const code = req.query.code as string;

    const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        },
        { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;

    const user = await prisma.user.upsert({
        where: { githubId: String(githubUser.id) },
        update: { username: githubUser.login },
        create: {
            githubId: String(githubUser.id),
            username: githubUser.login,
        },
    });

    const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );

    res.json({ token, user });
});

app.get("/me", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        res.json({ decoded });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.get("/repos/:owner/:repo/import", async (req, res) => {
    const { owner, repo } = req.params;

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
            headers: { Accept: "application/vnd.github+json" },
            params: { state: "all", per_page: 20 },
        }
    );

    const issues = response.data.filter((item: any) => !item.pull_request);

    const saved = [];
    for (const issue of issues) {
        const saved_issue = await prisma.issue.upsert({
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
                repo: `${owner}/${repo}`,
                author: issue.user.login,
                createdAt: new Date(issue.created_at),
                updatedAt: new Date(issue.updated_at),
            },
        });
        saved.push(saved_issue);
    }

    res.json({ imported: saved.length, issues: saved });
});

app.get("/issues", async (req, res) => {
    const issues = await prisma.issue.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(issues);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});