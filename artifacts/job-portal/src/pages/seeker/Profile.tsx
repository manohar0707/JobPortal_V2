import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, FileText, Camera, User, MapPin, BookOpen, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  skillsInput: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SeekerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const resumeRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName ?? user?.fullName ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
      experience: profile?.experience != null ? String(profile.experience) : "",
      education: profile?.education ?? "",
      skillsInput: profile?.skills?.join(", ") ?? "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    const skills = data.skillsInput
      ? data.skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    updateProfile.mutate(
      {
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          bio: data.bio,
          location: data.location,
          experience: data.experience ? Number(data.experience) : undefined,
          education: data.education,
          skills,
        },
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        },
        onError: () => toast.error("Failed to update profile"),
      }
    );
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("jp_token");
      const res = await fetch("/api/users/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Resume uploaded successfully");
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    } catch {
      toast.error("Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("jp_token");
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Avatar updated");
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <Layout>
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["seeker"]}>
      <Layout>
        <div className="container max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>

          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar ?? undefined} />
                    <AvatarFallback className="text-xl">{profile?.fullName?.substring(0, 2).toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 hover:opacity-90"
                    data-testid="button-upload-avatar"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile?.fullName}</h2>
                  <p className="text-muted-foreground text-sm">{profile?.email}</p>
                  {profile?.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {profile.location}
                    </p>
                  )}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.skills.slice(0, 5).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {profile?.resumeName ? (
                    <a href={profile.resumeUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.resumeName}
                    </a>
                  ) : (
                    <span>No resume uploaded</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resumeRef.current?.click()}
                  disabled={uploadingResume}
                  data-testid="button-upload-resume"
                >
                  {uploadingResume ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {profile?.resumeUrl ? "Replace Resume" : "Upload Resume"}
                </Button>
                <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} data-testid="input-fullName" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input {...field} data-testid="input-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea {...field} rows={3} placeholder="Tell recruiters about yourself..." data-testid="textarea-bio" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input {...field} placeholder="City, Country" data-testid="input-location" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl><Input {...field} type="number" min="0" data-testid="input-experience" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="education" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. B.Sc. Computer Science, MIT" data-testid="input-education" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="skillsInput" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma-separated)</FormLabel>
                      <FormControl><Input {...field} placeholder="React, Node.js, TypeScript..." data-testid="input-skills" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-profile">
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
