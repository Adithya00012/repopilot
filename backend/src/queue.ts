import { Queue } from "bullmq";

const connection = {
    host: "localhost",
    port: 6379,
};

export const issueQueue = new Queue("issue-processing", { connection });

export { connection };