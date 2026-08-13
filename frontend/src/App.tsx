import { Routes, Route } from "react-router-dom";
import IssueList from "./IssueList";
import IssueDetail from "./IssueDetail";
import Assistant from "./Assistant";
import Reports from "./Reports";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IssueList />} />
      <Route path="/issues/:id" element={<IssueDetail />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default App;