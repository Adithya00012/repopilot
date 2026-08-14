import { Queue } from "bullmq";

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
};

export const issueQueue = new Queue("issue-processing", { connection });

export { connection };