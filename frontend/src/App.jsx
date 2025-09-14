import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import Send from "./pages/Send.jsx";
import History from "./pages/History.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">Bulk Mail</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="hover:underline">Send</Link>
            <Link to="/history" className="hover:underline">History</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Send />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      <footer className="text-center text-xs text-slate-500 py-6">
        MERN • Nodemailer • MongoDB
      </footer>
    </BrowserRouter>
  );
}