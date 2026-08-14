import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown"; 
import { API_URL } from "./config";

function Reports() {
    const [releaseNotes, setReleaseNotes] = useState("");
    const [frequentProblems, setFrequentProblems] = useState("");
    const [highPriority, setHighPriority] = useState<any>(null);
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState("");

    const fetchReleaseNotes = async () => {
        setLoading("release");
        const res = await fetch(`${API_URL}/reports/release-notes`);
        const data = await res.json();
        setReleaseNotes(data.notes);
        setLoading("");
    };

    const fetchFrequentProblems = async () => {
        setLoading("frequent");
        const res = await fetch(`${API_URL}/reports/frequent-problems`);
        const data = await res.json();
        setFrequentProblems(data.summary);
        setLoading("");
    };

    const fetchHighPriority = async () => {
        setLoading("priority");
        const res = await fetch(`${API_URL}/reports/high-priority`);
        const data = await res.json();
        setHighPriority(data);
        setLoading("");
    };

    const fetchContributors = async () => {
        setLoading("contributors");
        const res = await fetch(`${API_URL}/reports/contributors`);
        const data = await res.json();
        setContributors(data.contributors);
        setLoading("");
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Link to="/" className="text-blue-600 hover:underline text-sm">← Back to issues</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-6">Weekly Reports</h1>

            <section className="mb-6 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Release Notes</h2>
                    <button
                        onClick={fetchReleaseNotes}
                        disabled={loading === "release"}
                        className="text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        {loading === "release" ? "Generating..." : "Generate"}
                    </button>
                </div>
                {releaseNotes && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 prose prose-sm max-w-none">
                        <ReactMarkdown>{releaseNotes}</ReactMarkdown>
                    </div>
                )}  
            </section>

            <section className="mb-6 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Frequently Reported Problems</h2>
                    <button
                        onClick={fetchFrequentProblems}
                        disabled={loading === "frequent"}
                        className="text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        {loading === "frequent" ? "Analyzing..." : "Generate"}
                    </button>
                </div>
                {frequentProblems && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 prose prose-sm max-w-none">
                        <ReactMarkdown>{frequentProblems}</ReactMarkdown>
                    </div>
                )}
            </section>

            <section className="mb-6 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">High-Priority Unresolved Issues</h2>
                    <button
                        onClick={fetchHighPriority}
                        disabled={loading === "priority"}
                        className="text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        {loading === "priority" ? "Checking..." : "Generate"}
                    </button>
                </div>
                {highPriority && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 space-y-1">
                        <p>Stale issues (30+ days): {highPriority.staleCount}</p>
                        <p>Security-labeled: {highPriority.securityCount}</p>
                        <p>Unapproved: {highPriority.unapprovedCount}</p>
                    </div>
                )}
            </section>

            <section className="mb-6 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Contributor Summary</h2>
                    <button
                        onClick={fetchContributors}
                        disabled={loading === "contributors"}
                        className="text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        {loading === "contributors" ? "Loading..." : "Generate"}
                    </button>
                </div>
                {contributors.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-800">
                        {contributors.map((c) => (
                            <li key={c.author} className="bg-gray-50 rounded px-3 py-1.5">
                                {c.author} — {c.issueCount} issue(s)
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default Reports;