import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useGetMyCompanies,
  useCreateJob,
  useUpdateJob,
  useGetJob,
  getGetMyJobsQueryKey,
  getGetJobQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const jobSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  company: z.string().min(1, "Please select a company"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  salary: z.string().min(1, "Salary is required"),
  experience: z.string().optional(),
  requirementsInput: z.string().optional(),
  skillsInput: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

interface JobFormPageProps {
  jobId?: string;
}

export default function JobFormPage({ jobId }: JobFormPageProps) {
  const isEdit = !!jobId;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: companies, isLoading: companiesLoading } = useGetMyCompanies();
  const { data: existingJob, isLoading: jobLoading } = useGetJob(jobId!, {
    query: { enabled: isEdit, queryKey: getGetJobQueryKey(jobId!) },
  });
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      company: "",
      location: "",
      type: "full-time",
      salary: "",
      experience: "",
      requirementsInput: "",
      skillsInput: "",
    },
  });

  useEffect(() => {
    if (existingJob) {
      form.reset({
        title: existingJob.title,
        description: existingJob.description,
        company: typeof existingJob.company === "string" ? existingJob.company : (existingJob.company as any)?._id ?? "",
        location: existingJob.location,
        type: existingJob.type as any,
        salary: existingJob.salary,
        experience: existingJob.experience ?? "",
        requirementsInput: existingJob.requirements?.join("\n") ?? "",
        skillsInput: existingJob.skills?.join(", ") ?? "",
      });
    }
  }, [existingJob, form]);

  const onSubmit = (data: JobForm) => {
    const payload = {
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      type: data.type,
      salary: data.salary,
      experience: data.experience,
      requirements: data.requirementsInput ? data.requirementsInput.split("\n").map((r) => r.trim()).filter(Boolean) : [],
      skills: data.skillsInput ? data.skillsInput.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };

    if (isEdit) {
      updateJob.mutate(
        { id: jobId!, data: payload },
        {
          onSuccess: () => {
            toast.success("Job updated");
            queryClient.invalidateQueries({ queryKey: getGetMyJobsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId!) });
            setLocation("/recruiter/jobs");
          },
          onError: () => toast.error("Failed to update job"),
        }
      );
    } else {
      createJob.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success("Job posted successfully");
            queryClient.invalidateQueries({ queryKey: getGetMyJobsQueryKey() });
            setLocation("/recruiter/jobs");
          },
          onError: () => toast.error("Failed to post job"),
        }
      );
    }
  };

  const isLoading = companiesLoading || (isEdit && jobLoading);
  const isPending = createJob.isPending || updateJob.isPending;

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <Layout>
        <div className="container max-w-3xl px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/recruiter/jobs">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            </Link>
            <h1 className="text-2xl font-bold">{isEdit ? "Edit Job" : "Post a Job"}</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Senior React Developer" data-testid="input-title" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies?.map((c) => (
                              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {!companies?.length && (
                          <p className="text-xs text-muted-foreground">
                            No companies yet. <Link href="/recruiter/companies"><span className="text-primary underline cursor-pointer">Add one first.</span></Link>
                          </p>
                        )}
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. San Francisco, CA" data-testid="input-location" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["full-time", "part-time", "contract", "internship", "remote"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="salary" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary / Range</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. $120k - $160k" data-testid="input-salary" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="experience" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Required</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 3-5 years" data-testid="input-experience" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl><Textarea {...field} rows={5} placeholder="Describe the role, responsibilities, and company culture..." data-testid="textarea-description" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="requirementsInput" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (one per line)</FormLabel>
                        <FormControl><Textarea {...field} rows={4} placeholder={"5+ years React experience\nStrong TypeScript skills\nExperience with REST APIs"} data-testid="textarea-requirements" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="skillsInput" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl><Input {...field} placeholder="React, TypeScript, Node.js, PostgreSQL" data-testid="input-skills" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex gap-3 pt-2">
                      <Button type="submit" disabled={isPending} data-testid="button-submit-job">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isEdit ? "Update Job" : "Post Job"}
                      </Button>
                      <Link href="/recruiter/jobs">
                        <Button type="button" variant="outline">Cancel</Button>
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
