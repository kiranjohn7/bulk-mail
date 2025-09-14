import { useEffect, useState } from "react";
import api from "../lib/api";

export default function History() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/mail/history").then(({ data }) => setItems(data.items || []));
  }, []);

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Email History</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Subject</th>
              <th className="border px-3 py-2 text-left">Recipients</th>
              <th className="border px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id}>
                <td className="border px-3 py-2">{new Date(it.createdAt).toLocaleString()}</td>
                <td className="border px-3 py-2">{it.subject}</td>
                <td className="border px-3 py-2">{(it.recipients || []).join(", ")}</td>
                <td className="border px-3 py-2">
                  <span
                    className={
                      it.status === "success"
                        ? "text-green-700"
                        : it.status === "failed"
                        ? "text-red-700"
                        : "text-amber-700"
                    }
                  >
                    {it.status}
                  </span>
                  {it.error ? <div className="text-xs text-red-500 mt-1">{it.error}</div> : null}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="border px-3 py-6 text-center" colSpan="4">
                  No emails yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}