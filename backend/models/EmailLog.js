import mongoose from "mongoose";

const EmailLogSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: { type: [String], default: [] },
    status: { type: String, enum: ["success", "failed"], required: true },
    error: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("EmailLog", EmailLogSchema);