import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAdminListJobs, useAdminDeleteJob, getAdminListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Briefcase, Trash2, ChevronLeft, ChevronRight, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminJobs() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const params = { page };
  const { data, isLoading } = useAdminListJobs(params, { query: { queryKey: getAdminListJobsQueryKey(params) } });
  const deleteJob = useAdminDeleteJob();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete job "${title}"?`)) return;
    deleteJob.mutate({ id }, {
      onSuccess: () => {
        toast.success("Job deleted");
        queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey(params) });
      },
      onError: () => toast.error("Failed to delete job"),
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="container max-w-5xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Manage Jobs</h1>
            <p className="text-muted-foreground mt-1">{data?.total ?? 0} total jobs</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : !data?.jobs?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No jobs found</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {data.jobs.map((job) => {
                  const company = job.company as any;
                  return (
                    <Card key={job._id} className="bg-card border-border" data-testid={`card-job-${job._id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm" data-testid={`text-job-title-${job._id}`}>{job.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {company?.name && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company.name}</span>}
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                              <span>{job.salary}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs capitalize">{job.type}</Badge>
                            <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                              {job.isActive ? "Active" : "Closed"}
                            </Badge>
                            <span className="text-xs text-muted-foreground hidden sm:block">{job.applicantsCount ?? 0} applicants</span>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleDelete(job._id, job.title)}
                              data-testid={`button-delete-job-${job._id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {(data?.pages ?? 1) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {data?.pages}</span>
                  <Button variant="outline" size="sm" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
