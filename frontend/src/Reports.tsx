import { useState } from "react";
import { Link } from "react-router-dom";

function Reports() {
    const [releaseNotes, setReleaseNotes] = useState("");
    const [frequentProblems, setFrequentProblems] = useState("");
    const [highPriority, setHighPriority] = useState<any>(null);
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState("");

    const fetchReleaseNotes = async () => {
        setLoading("release");
        const res = await fetch("http://localhost:4000/reports/release-notes");
        const data = await res.json();
        setReleaseNotes(data.notes);
        setLoading("");
    };

    const fetchFrequentProblems = async () => {
        setLoading("frequent");
        const res = await fetch("http://localhost:4000/reports/frequent-problems");
        const data = await res.json();
        setFrequentProblems(data.summary);
        setLoading("");
    };

    const fetchHighPriority = async () => {
        setLoading("priority");
        const res = await fetch("http://localhost:4000/reports/high-priority");
        const data = await res.json();
        setHighPriority(data);
        setLoading("");
    };

    const fetchContributors = async () => {
        setLoading("contributors");
        const res = await fetch("http://localhost:4000/reports/contributors");
        const data = await res.json();
        setContributors(data.contributors);
        setLoading("");
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "800px" }}>
            <Link to="/">← Back to issues</Link>
            <h1>Weekly Reports</h1>

            <section style={{ marginBottom: "2rem" }}>
                <h2>Release Notes</h2>
                <button onClick={fetchReleaseNotes} disabled={loading === "release"}>
                    {loading === "release" ? "Generating..." : "Generate"}
                </button>
                {releaseNotes && (
                    <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem" }}>
                        {releaseNotes}
                    </pre>
                )}
            </section>

            <section style={{ marginBottom: "2rem" }}>
                <h2>Frequently Reported Problems</h2>
                <button onClick={fetchFrequentProblems} disabled={loading === "frequent"}>
                    {loading === "frequent" ? "Analyzing..." : "Generate"}
                </button>
                {frequentProblems && (
                    <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem" }}>
                        {frequentProblems}
                    </pre>
                )}
            </section>

            <section style={{ marginBottom: "2rem" }}>
                <h2>High-Priority Unresolved Issues</h2>
                <button onClick={fetchHighPriority} disabled={loading === "priority"}>
                    {loading === "priority" ? "Checking..." : "Generate"}
                </button>
                {highPriority && (
                    <div style={{ background: "#f5f5f5", padding: "1rem" }}>
                        <p>Stale issues (30+ days): {highPriority.staleCount}</p>
                        <p>Security-labeled: {highPriority.securityCount}</p>
                        <p>Unapproved: {highPriority.unapprovedCount}</p>
                    </div>
                )}
            </section>

            <section style={{ marginBottom: "2rem" }}>
                <h2>Contributor Summary</h2>
                <button onClick={fetchContributors} disabled={loading === "contributors"}>
                    {loading === "contributors" ? "Loading..." : "Generate"}
                </button>
                {contributors.length > 0 && (
                    <ul>
                        {contributors.map((c) => (
                            <li key={c.author}>
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