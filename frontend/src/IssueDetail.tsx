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
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:4000/issues/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ label, approved: true }),
    });
    const updated = await res.json();
    setIssue(updated);
  };

  if (!issue) {
    return <div className="max-w-3xl mx-auto p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/" className="text-blue-600 hover:underline text-sm">← Back to issues</Link>

      <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-3 leading-snug">
        #{issue.number} — {issue.title}
      </h1>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          Author: {issue.author}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${issue.state === "open" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
            }`}
        >
          {issue.state}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${issue.approved ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {issue.approved ? "Approved" : "Not approved"}
        </span>
      </div>

      <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 mb-6">
        {issue.body}
      </pre>

      {similar.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Possible Duplicates</h3>
          <ul className="space-y-1">
            {similar.map((s) => (
              <li key={s.id} className="text-sm">
                <Link to={`/issues/${s.id}`} className="text-blue-600 hover:underline">
                  #{s.number} — {s.title} ({s.state})
                </Link>{" "}
                <span className="text-gray-500">— {(s.similarity * 100).toFixed(1)}% similar</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-700">
            Label:{" "}
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="ml-1 border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">-- select --</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Documentation">Documentation</option>
              <option value="Security">Security</option>
              <option value="Question">Question</option>
            </select>
          </label>

          <button
            onClick={handleSuggest}
            className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Suggest with AI
          </button>

          <button
            onClick={handleCheckCompleteness}
            className="text-sm px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-800 text-white"
          >
            Check Completeness
          </button>

          <button
            onClick={handleApprove}
            className="text-sm px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white ml-auto"
          >
            Approve
          </button>
        </div>

        {completeness && (
          <p
            className={`text-sm px-3 py-2 rounded ${completeness.complete ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
          >
            {completeness.complete ? "✅ Complete" : "⚠️ Incomplete"} — {completeness.reason}
          </p>
        )}

        <div>
          <button
            onClick={handleDraftResponse}
            className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Draft Response
          </button>

          {draft && (
            <div className="mt-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              />
              <button className="mt-2 text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                Send Response
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;