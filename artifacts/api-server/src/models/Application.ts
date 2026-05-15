import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema);
