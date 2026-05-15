import { useGetJob, getGetJobQueryKey, useApplyJob } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building, MapPin, Clock, CircleDollarSign, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const { data: job, isLoading } = useGetJob(id!, {
    query: {
      enabled: !!id,
      queryKey: getGetJobQueryKey(id!),
    }
  });

  const applyMutation = useApplyJob();

  const handleApply = () => {
    applyMutation.mutate({
      jobId: id!,
      data: { coverLetter }
    }, {
      onSuccess: () => {
        toast.success("Application submitted successfully!");
        setIsApplyOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to apply");
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center text-muted-foreground">
          Job not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto py-12 px-4 md:px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground mt-4">
                <div className="flex items-center text-foreground font-medium">
                  <Building className="mr-2 h-5 w-5" />
                  {job.company.name}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {job.type.replace("-", " ")}
                </div>
                <div className="flex items-center">
                  <CircleDollarSign className="mr-2 h-5 w-5" />
                  {job.salary}
                </div>
                {job.experience && (
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    {job.experience} experience
                  </div>
                )}
              </div>
            </div>
            <div>
              {user?.role === "seeker" ? (
                <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6">Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Submit your application to {job.company.name}. Your profile information will be sent automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <label className="text-sm font-medium mb-2 block">Cover Letter (Optional)</label>
                      <Textarea 
                        placeholder="Write a brief cover letter..."
                        rows={6}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                      <Button onClick={handleApply} disabled={applyMutation.isPending}>
                        {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : user ? (
                <Button disabled variant="outline">Sign in as seeker to apply</Button>
              ) : (
                <Button onClick={() => window.location.href = '/login'}>Log in to apply</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 md:px-6 max-w-5xl grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{job.description}</p>
            </div>
          </section>

          {job.requirements && job.requirements.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          {job.skills && job.skills.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1 px-3">{skill}</Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{job.company.name}</h3>
                {job.company.industry && <p className="text-sm text-muted-foreground">{job.company.industry}</p>}
              </div>
              {job.company.description && (
                <p className="text-sm text-muted-foreground">{job.company.description}</p>
              )}
              <div className="space-y-2 pt-2 border-t border-border">
                {job.company.website && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Website</span>
                    <a href={job.company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a>
                  </div>
                )}
                {job.company.size && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span>{job.company.size} employees</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Job Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span>{new Date(job.createdAt || "").toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicants</span>
                  <span>{job.applicantsCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
