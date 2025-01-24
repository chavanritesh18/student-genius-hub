import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import QA from "./pages/QA";
import Presentations from "./pages/Presentations";
import CodeEditor from "./pages/CodeEditor";
import Subjects from "./pages/Subjects";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/qa" element={<QA />} />
        <Route path="/presentations" element={<Presentations />} />
        <Route path="/code-editor" element={<CodeEditor />} />
        <Route path="/subjects" element={<Subjects />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;