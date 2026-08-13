import { useState, useEffect } from "react";    
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
    const [repos, setRepos] = useState<string[]>([]);
    const [selectedRepo, setSelectedRepo] = useState("");

    useEffect(() => {
        fetch("http://localhost:4000/repos")
            .then((res) => res.json())
            .then((data) => setRepos(data));
    }, []);

    const handleAsk = async () => {
        if (!question.trim()) return;

        const userMsg: Message = { role: "user", text: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");
        setLoading(true);

        const res = await fetch("http://localhost:4000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: userMsg.text, repo: selectedRepo || undefined }),
        });
        const data = await res.json();

        setMessages((prev) => [
            ...prev,
            { role: "assistant", text: data.answer, sources: data.sources },
        ]);
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link to="/" className="text-blue-600 hover:underline text-sm">← Back to issues</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-4">Repo Assistant</h1>
            <div className="mb-4">
                <label className="text-sm text-gray-700">
                    Repo:{" "}
                    <select
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        className="ml-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value="">All repos</option>
                        {repos.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="space-y-4 mb-4">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-lg text-sm ${m.role === "user" ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-800"
                            }`}
                    >
                        <p className="font-semibold mb-1">{m.role === "user" ? "You" : "Assistant"}</p>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        {m.sources && (
                            <p className="text-xs text-gray-500 mt-2">Sources: {m.sources.join(", ")}</p>
                        )}
                    </div>
                ))}
                {loading && <p className="text-sm text-gray-500">Thinking...</p>}
            </div>

            <div className="flex gap-2">
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="Ask about this repo..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                    onClick={handleAsk}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                    Ask
                </button>
            </div>
        </div>
    );
}

export default Assistant;