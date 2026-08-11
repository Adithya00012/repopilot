import OpenAI from "openai";

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function categorizeIssue(title: string, body: string) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content:
                    "You are an issue triage assistant. Categorize the GitHub issue into exactly one of: Bug, Feature Request, Documentation, Security, Question. Reply with only the category name, nothing else.",
            },
            {
                role: "user",
                content: `Title: ${title}\n\nBody: ${body || "(no description)"}`,
            },
        ],
    });

    return response.choices[0].message.content?.trim();
}

export async function checkCompleteness(title: string, body: string) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content:
                    "You are an issue triage assistant. Determine if this GitHub issue has enough information to reproduce the problem (clear steps, expected vs actual behavior, or a code example). Reply with only JSON in this exact format: {\"complete\": true or false, \"reason\": \"short explanation\"}",
            },
            {
                role: "user",
                content: `Title: ${title}\n\nBody: ${body || "(no description)"}`,
            },
        ],
    });

    const content = response.choices[0].message.content?.trim() || "{}";
    return JSON.parse(content);
}

export default groq;