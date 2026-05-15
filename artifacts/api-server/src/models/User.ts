import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "seeker" | "recruiter" | "admin";
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  resumeUrl?: string;
  resumeName?: string;
  experience?: number;
  education?: string;
  location?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["seeker", "recruiter", "admin"], required: true },
    phoneNumber: { type: String },
    avatar: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    resumeUrl: { type: String },
    resumeName: { type: String },
    experience: { type: Number },
    education: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
