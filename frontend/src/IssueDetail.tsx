import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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

  useEffect(() => {
    fetch(`http://localhost:4000/issues/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setIssue(data);
        setLabel(data.label || "");
      });
  }, [id]);

  const handleSuggest = async () => {
    const res = await fetch(`http://localhost:4000/issues/${id}/categorize`, {
      method: "POST",
    });
    const data = await res.json();
    setLabel(data.suggestedCategory);
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
        <button onClick={handleApprove} style={{ marginLeft: "1rem" }}>
          Approve
        </button>
      </div>
    </div>
  );
}

export default IssueDetail;