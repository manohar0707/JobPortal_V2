import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetMyJobs, useDeleteJob, getGetMyJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Briefcase, Plus, Edit, Trash2, Users, MapPin } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecruiterJobs() {
  const { data: jobs, isLoading } = useGetMyJobs();
  const deleteJob = useDeleteJob();
  const queryClient = useQueryClient();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteJob.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Job deleted");
          queryClient.invalidateQueries({ queryKey: getGetMyJobsQueryKey() });
        },
        onError: () => toast.error("Failed to delete job"),
      }
    );
  };

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <Layout>
        <div className="container max-w-5xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Job Postings</h1>
              <p className="text-muted-foreground mt-1">{jobs?.length ?? 0} jobs posted</p>
            </div>
            <Link href="/recruiter/jobs/new">
              <Button data-testid="button-post-job">
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !jobs?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No jobs posted yet</p>
              <Link href="/recruiter/jobs/new">
                <Button className="mt-4"><Plus className="h-4 w-4 mr-2" />Post your first job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job._id} className="bg-card border-border" data-testid={`card-job-${job._id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground" data-testid={`text-job-title-${job._id}`}>{job.title}</h3>
                          <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                            {job.isActive ? "Active" : "Closed"}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">{job.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {job.applicantsCount ?? 0} applicants
                          </span>
                          <span>{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/recruiter/jobs/${job._id}/applicants`}>
                          <Button variant="outline" size="sm" data-testid={`button-applicants-${job._id}`}>
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            Applicants
                          </Button>
                        </Link>
                        <Link href={`/recruiter/jobs/${job._id}/edit`}>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-${job._id}`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(job._id, job.title)}
                          disabled={deleteJob.isPending}
                          data-testid={`button-delete-${job._id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
