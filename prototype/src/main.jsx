import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import Leeromgeving from "@/pages/Leeromgeving";
import LeerCoach from "@/pages/LeerCoach";
import LeerBeheer from "@/pages/LeerBeheer";
import DemoBar from "./DemoBar";
import { ensureDemo } from "./demoData";

function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { ensureDemo().then(() => setReady(true)); }, []);
  if (!ready) return <p style={{ padding: 32, fontFamily: "system-ui" }}>Demo wordt klaargezet…</p>;
  return (
    <HashRouter>
      <DemoBar />
      <Routes>
        <Route path="/" element={<Navigate to="/leren" replace />} />
        <Route path="/leren" element={<Leeromgeving />} />
        <Route path="/leren/coach" element={<LeerCoach />} />
        <Route path="/leren/beheer" element={<LeerBeheer />} />
        <Route path="*" element={<Navigate to="/leren" replace />} />
      </Routes>
    </HashRouter>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
