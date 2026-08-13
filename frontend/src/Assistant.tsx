import { useState } from "react";
import { Link } from "react-router-dom";

interface Message {
    role: "user" | "assistant";
    text: string;
    sources?: string[];
}

function Assistant() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!question.trim()) return;

        const userMsg: Message = { role: "user", text: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");
        setLoading(true);

        const res = await fetch("http://localhost:4000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: userMsg.text }),
        });
        const data = await res.json();

        setMessages((prev) => [
            ...prev,
            { role: "assistant", text: data.answer, sources: data.sources },
        ]);
        setLoading(false);
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "700px" }}>
            <Link to="/">← Back to issues</Link>
            <h1>Repo Assistant</h1>

            <div style={{ marginBottom: "1rem" }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: "1rem" }}>
                        <strong>{m.role === "user" ? "You" : "Assistant"}:</strong>
                        <p>{m.text}</p>
                        {m.sources && (
                            <p style={{ fontSize: "0.8rem", color: "#666" }}>
                                Sources: {m.sources.join(", ")}
                            </p>
                        )}
                    </div>
                ))}
                {loading && <p>Thinking...</p>}
            </div>

            <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="Ask about this repo..."
                style={{ width: "80%", padding: "0.5rem" }}
            />
            <button onClick={handleAsk} style={{ marginLeft: "0.5rem" }}>
                Ask
            </button>
        </div>
    );
}

export default Assistant;