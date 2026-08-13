import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

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
  const [notification, setNotification] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/issues")
      .then((res) => res.json())
      .then((data) => setIssues(data));

    const socket = io("http://localhost:4000");
    socket.on("new-issue", (issue) => {
      setNotification(`New issue: #${issue.number} — ${issue.title}`);
      fetch("http://localhost:4000/issues")
        .then((res) => res.json())
        .then((data) => setIssues(data));
      setTimeout(() => setNotification(""), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>RepoPilot</h1>
      <Link to="/assistant">Ask the Repo Assistant →</Link>
      <br />
      <Link to="/reports">View Weekly Reports →</Link>
      <br />
      {localStorage.getItem("token") ? (
        <button onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>
          Logout
        </button>
      ) : (
        <a href="http://localhost:4000/auth/github">Login with GitHub →</a>
      )}
      <h2>Issues</h2>
      {notification && (
        <p style={{ background: "#d4f7d4", padding: "0.5rem" }}>{notification}</p>
      )}
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