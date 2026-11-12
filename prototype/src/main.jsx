import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import Leeromgeving from "@/pages/Leeromgeving";
import LeerCoach from "@/pages/LeerCoach";
import LeerBeheer from "@/pages/LeerBeheer";
import DemoBar from "./DemoBar";
import { ensureDemo } from "./demoData";
import { demo } from "./mock/base44Client";

// Als gepubliceerde pagina (artifact) zonder URL-routing; lokaal met #/leren-adressen.
const ARTIFACT = import.meta.env.VITE_ARTIFACT === "1";
const Router = ({ children }) => ARTIFACT
  ? <MemoryRouter initialEntries={[demo.db.currentUser === "u-coach" ? "/leren/coach" : "/leren"]}>{children}</MemoryRouter>
  : <HashRouter>{children}</HashRouter>;

function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { ensureDemo().then(() => setReady(true)); }, []);
  if (!ready) return <p style={{ padding: 32, fontFamily: "system-ui" }}>Demo wordt klaargezet…</p>;
  return (
    <Router>
      <DemoBar />
      <Routes>
        <Route path="/" element={<Navigate to="/leren" replace />} />
        <Route path="/leren" element={<Leeromgeving />} />
        <Route path="/leren/coach" element={<LeerCoach />} />
        <Route path="/leren/beheer" element={<LeerBeheer />} />
        <Route path="*" element={<Navigate to="/leren" replace />} />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
