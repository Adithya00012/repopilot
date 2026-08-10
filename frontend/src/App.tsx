import { Routes, Route } from "react-router-dom";
import IssueList from "./IssueList";
import IssueDetail from "./IssueDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IssueList />} />
      <Route path="/issues/:id" element={<IssueDetail />} />
    </Routes>
  );
}

export default App;