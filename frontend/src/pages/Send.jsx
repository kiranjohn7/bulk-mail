import { useState } from "react";
import api from "../lib/api";

export default function Send() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("<p>Hello team 👋</p>");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const recipients = recipientsRaw
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!subject || !body || recipients.length === 0) {
      setMsg("Please fill subject, body, and at least one recipient.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/mail/send", { subject, body, recipients });
      if (data.ok) {
        setMsg("✅ Emails sent!");
        setSubject("");
        setBody("");
        setRecipientsRaw("");
      } else {
        setMsg("❌ Failed to send.");
      }
    } catch (e) {
        console.error(e);
      setMsg("❌ Failed to send.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Send Bulk Email</h1>
      {msg && <div className="p-3 rounded bg-slate-100">{msg}</div>}

      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Subject</span>
          <input
            className="border rounded px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Weekly update"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Email Body (HTML allowed)</span>
          <textarea
            className="border rounded px-3 py-2 min-h-40"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="<p>Hello…</p>"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Recipients (comma, semicolon, or newline)</span>
          <textarea
            className="border rounded px-3 py-2 min-h-28"
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
            placeholder={`jane@example.com, john@example.com\nperson@domain.com`}
          />
        </label>

        <button
          disabled={loading}
          className="justify-self-start bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Emails"}
        </button>
      </form>
    </section>
  );
}