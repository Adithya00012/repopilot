import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:4000")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage("Failed to connect to backend"));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>RepoPilot</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;