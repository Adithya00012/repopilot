import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface SimilarIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  similarity: number;
}

interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  author: string;
  repo: string;
  label: string | null;
  approved: boolean;
}

function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [label, setLabel] = useState("");
  const [similar, setSimilar] = useState<SimilarIssue[]>([]);
  const [completeness, setCompleteness] = useState<{ complete: boolean; reason: string } | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    fetch(`http://localhost:4000/issues/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setIssue(data);
        setLabel(data.label || "");
      });

    fetch(`http://localhost:4000/issues/${id}/similar`)
      .then((res) => res.json())
      .then((data) => setSimilar(data));
  }, [id]);

  const handleSuggest = async () => {
    const res = await fetch(`http://localhost:4000/issues/${id}/categorize`, {
      method: "POST",
    });
    const data = await res.json();
    setLabel(data.suggestedCategory);
  };

  const handleCheckCompleteness = async () => {
    const res = await fetch(`http://localhost:4000/issues/${id}/check-completeness`, {
      method: "POST",
    });
    const data = await res.json();
    setCompleteness(data);
  };

  const handleDraftResponse = async () => {
    const res = await fetch(`http://localhost:4000/issues/${id}/draft-response`, {
      method: "POST",
    });
    const data = await res.json();
    setDraft(data.draft);
  };

  const handleApprove = async () => {
    const res = await fetch(`http://localhost:4000/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, approved: true }),
    });
    const updated = await res.json();
    setIssue(updated);
  };

  if (!issue) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <Link to="/">← Back to issues</Link>
      <h1 style={{ lineHeight: "1.3" }}>#{issue.number} — {issue.title}</h1>
      <p><strong>Author:</strong> {issue.author}</p>
      <p><strong>State:</strong> {issue.state}</p>
      <p><strong>Approved:</strong> {issue.approved ? "Yes" : "No"}</p>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem" }}>
        {issue.body}
      </pre>

      {similar.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Possible Duplicates</h3>
          <ul>
            {similar.map((s) => (
              <li key={s.id}>
                <Link to={`/issues/${s.id}`}>
                  #{s.number} — {s.title} ({s.state})
                </Link>{" "}
                — similarity: {(s.similarity * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginTop: "1rem" }}>
        <label>
          Label:{" "}
          <select value={label} onChange={(e) => setLabel(e.target.value)}>
            <option value="">-- select --</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Documentation">Documentation</option>
            <option value="Security">Security</option>
            <option value="Question">Question</option>
          </select>
        </label>
        <button onClick={handleSuggest} style={{ marginLeft: "1rem" }}>
          Suggest with AI
        </button>
        <button onClick={handleCheckCompleteness} style={{ marginLeft: "1rem" }}>
          Check Completeness
        </button>

        {completeness && (
          <p style={{ marginTop: "0.5rem", color: completeness.complete ? "green" : "red" }}>
            {completeness.complete ? "✅ Complete" : "⚠️ Incomplete"} — {completeness.reason}
          </p>
        )}
        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleDraftResponse}>Draft Response</button>
          {draft && (
            <div style={{ marginTop: "0.5rem" }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                style={{ width: "100%", padding: "0.5rem" }}
              />
              <button style={{ marginTop: "0.5rem" }}>Send Response</button>
            </div>
          )}
        </div>
        <button onClick={handleApprove} style={{ marginLeft: "1rem" }}>
          Approve
        </button>
      </div>
    </div>
  );
}

export default IssueDetail;