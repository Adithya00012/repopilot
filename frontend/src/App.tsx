import { Routes, Route } from "react-router-dom";
import IssueList from "./IssueList";
import IssueDetail from "./IssueDetail";
import Assistant from "./Assistant";
import Reports from "./Reports";
import LoginSuccess from "./LoginSuccess";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IssueList />} />
      <Route path="/issues/:id" element={<IssueDetail />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/login-success" element={<LoginSuccess />} />
    </Routes>
  );
}

export default App;