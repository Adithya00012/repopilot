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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchIssues = (repo?: string, pageNum: number = 1) => {
    const params = new URLSearchParams();
    if (repo) params.set("repo", repo);
    params.set("page", String(pageNum));
    params.set("limit", "5");

    fetch(`http://localhost:4000/issues?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setIssues(data.issues);
        setTotalPages(data.totalPages);
        setPage(data.page);
      });
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
    fetchIssues(repo, 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">RepoPilot</h1>
        {localStorage.getItem("token") ? (
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}
            className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Logout
          </button>
        ) : (
          
            <a href="http://localhost:4000/auth/github"
            className="text-sm px-3 py-1.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white"
          >
            Login with GitHub
          </a>
        )}
      </div>

      <div className="flex gap-4 mb-6 text-sm">
        <Link to="/assistant" className="text-blue-600 hover:underline">Ask the Repo Assistant →</Link>
        <Link to="/reports" className="text-blue-600 hover:underline">View Weekly Reports →</Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="text-sm text-gray-700">
          Filter by repo:{" "}
          <select
            value={selectedRepo}
            onChange={(e) => handleRepoChange(e.target.value)}
            className="ml-1 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">All repos</option>
            {repos.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <input
            value={newRepo}
            onChange={(e) => setNewRepo(e.target.value)}
            placeholder="owner/repo"
            className="border border-gray-300 rounded px-2 py-1 text-sm w-40"
          />
          <button
            onClick={handleAddRepo}
            disabled={importing}
            className="text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {importing ? "Importing..." : "Add Repo"}
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">Issues</h2>
      {
    notification && (
      <p className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded mb-3">{notification}</p>
    )
  }

  <ul className="space-y-2">
    {issues.map((issue) => (
      <li key={issue.id}>
        <Link
          to={`/issues/${issue.id}`}
          className="block p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <span className="text-gray-500">#{issue.number}</span>{" "}
          <span className="font-medium text-gray-900">{issue.title}</span>{" "}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ml-1 ${issue.state === "open" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
              }`}
          >
            {issue.state}
          </span>
          <div className="text-sm text-gray-500 mt-1">by {issue.author}</div>
        </Link>
      </li>
    ))}
  </ul>

  {
    totalPages > 1 && (
      <div className="flex items-center justify-center gap-3 mt-4 text-sm">
        <button
          onClick={() => fetchIssues(selectedRepo, page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => fetchIssues(selectedRepo, page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )
  }
    </div >
  );
}

export default IssueList;