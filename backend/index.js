import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import EmailLog from "./models/EmailLog.js";

dotenv.config();

const app = express();

// CORS (near the top, before routes)
const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  // add your prod frontend later, e.g. "https://your-frontend.netlify.app"
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server or curl/Postman
    return ALLOWED_ORIGINS.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  // <-- remove allowedHeaders to let cors mirror request headers
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// <-- remove the explicit app.options(...) line

app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI in environment");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => {
    console.error("MongoDB error:", e?.message || e);
    process.exit(1);
  });

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn("SMTP credentials missing — email sending will fail.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
});

app.get("/health", (_req, res) =>
  res.json({ ok: true, uptime: process.uptime() })
);

app.post("/api/mail/send", async (req, res) => {
  try {
    const { subject, body, recipients } = req.body || {};
    if (
      !subject ||
      !body ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Subject, body, and recipients[] are required." });
    }

    const info = await transporter.sendMail({
      from: `"Bulk Mailer" <${smtpUser}>`,
      to: "undisclosed-recipients:;",
      bcc: recipients,
      subject,
      html: body,
    });

    await EmailLog.create({ subject, body, recipients, status: "success" });
    return res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error("Send error:", e?.message || e);
    try {
      await EmailLog.create({
        subject: req.body?.subject || "",
        body: req.body?.body || "",
        recipients: req.body?.recipients || [],
        status: "failed",
        error: String(e?.message || e),
      });
    } catch {}
    return res
      .status(500)
      .json({ ok: false, message: "Failed to send emails." });
  }
});

app.get("/api/mail/history", async (_req, res) => {
  const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(100);
  res.json({ items: logs });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.message || err);
  res.status(500).json({ ok: false, message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Bulk Mail API running at http://localhost:${PORT}`)
);
