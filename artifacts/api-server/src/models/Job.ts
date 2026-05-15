import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  company: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salary: string;
  experience?: string;
  skills: string[];
  applicantsCount: number;
  isActive: boolean;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    salary: { type: String, required: true },
    experience: { type: String },
    skills: [{ type: String }],
    applicantsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", description: "text", location: "text" });

export const Job = mongoose.model<IJob>("Job", JobSchema);
