import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  logo?: string;
  recruiter: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    website: { type: String },
    location: { type: String },
    industry: { type: String },
    size: { type: String },
    logo: { type: String },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>("Company", CompanySchema);
