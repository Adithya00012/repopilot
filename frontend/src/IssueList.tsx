import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  author: string;
  repo: string;
}

function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/issues")
      .then((res) => res.json())
      .then((data) => setIssues(data));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>RepoPilot</h1>
      <h2>Issues</h2>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            <Link to={`/issues/${issue.id}`}>
              #{issue.number} — {issue.title} ({issue.state}) by {issue.author}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IssueList;