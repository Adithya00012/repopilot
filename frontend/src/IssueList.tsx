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
  const [repos, setRepos] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [newRepo, setNewRepo] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchIssues = (repo?: string) => {
    const url = repo
      ? `http://localhost:4000/issues?repo=${encodeURIComponent(repo)}`
      : "http://localhost:4000/issues";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setIssues(data));
  };

  const fetchRepos = () => {
    fetch("http://localhost:4000/repos")
      .then((res) => res.json())
      .then((data) => setRepos(data));
  };

  useEffect(() => {
    fetchIssues();
    fetchRepos();

    const socket = io("http://localhost:4000");
    socket.on("new-issue", (issue) => {
      setNotification(`New issue: #${issue.number} — ${issue.title}`);
      fetchIssues();
      fetchRepos();
      setTimeout(() => setNotification(""), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAddRepo = async () => {
    if (!newRepo.includes("/")) {
      alert("Enter repo as owner/repo");
      return;
    }
    setImporting(true);
    const [owner, repo] = newRepo.split("/");
    await fetch(`http://localhost:4000/repos/${owner}/${repo}/import`);
    setNewRepo("");
    fetchRepos();
    fetchIssues(selectedRepo);
    setImporting(false);
  };

  const handleRepoChange = (repo: string) => {
    setSelectedRepo(repo);
    fetchIssues(repo);
  };

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

      <div style={{ marginTop: "1rem" }}>
        <label>
          Filter by repo:{" "}
          <select value={selectedRepo} onChange={(e) => handleRepoChange(e.target.value)}>
            <option value="">All repos</option>
            {repos.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <input
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          placeholder="owner/repo"
          style={{ padding: "0.4rem" }}
        />
        <button onClick={handleAddRepo} disabled={importing} style={{ marginLeft: "0.5rem" }}>
          {importing ? "Importing..." : "Add Repo"}
        </button>
      </div>

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