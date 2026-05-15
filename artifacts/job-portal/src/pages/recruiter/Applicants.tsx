import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useGetApplicants,
  useUpdateApplicationStatus,
  useGetJob,
  getGetApplicantsQueryKey,
  getGetJobQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Users, FileText, Download } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const statuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
};

interface Props {
  jobId: string;
}

export default function Applicants({ jobId }: Props) {
  const queryClient = useQueryClient();
  const { data: applicants, isLoading } = useGetApplicants(jobId, {
    query: { queryKey: getGetApplicantsQueryKey(jobId) },
  });
  const { data: job } = useGetJob(jobId, { query: { queryKey: getGetJobQueryKey(jobId) } });
  const updateStatus = useUpdateApplicationStatus();

  const handleStatusChange = (applicationId: string, status: string) => {
    updateStatus.mutate(
      { applicationId, data: { status: status as any } },
      {
        onSuccess: () => {
          toast.success("Status updated");
          queryClient.invalidateQueries({ queryKey: getGetApplicantsQueryKey(jobId) });
        },
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <Layout>
        <div className="container max-w-5xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/recruiter/jobs">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            </Link>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Applicants</h1>
            {job && <p className="text-muted-foreground mt-1">{job.title} · {applicants?.length ?? 0} applicants</p>}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !applicants?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No applicants yet</p>
              <p className="text-sm mt-1">Share your job to attract candidates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((app) => {
                const applicant = app.applicant as any;
                return (
                  <Card key={app._id} className="bg-card border-border" data-testid={`card-applicant-${app._id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={applicant?.avatar ?? undefined} />
                          <AvatarFallback>{applicant?.fullName?.substring(0, 2).toUpperCase() ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <p className="font-semibold text-sm" data-testid={`text-applicant-name-${app._id}`}>
                                {applicant?.fullName ?? "Applicant"}
                              </p>
                              <p className="text-xs text-muted-foreground">{applicant?.email}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                {applicant?.location && <span>{applicant.location}</span>}
                                {applicant?.experience != null && <span>{applicant.experience} yrs exp</span>}
                                {applicant?.skills?.length > 0 && (
                                  <span>{applicant.skills.slice(0, 3).join(", ")}</span>
                                )}
                              </div>
                              {app.coverLetter && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{app.coverLetter}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {applicant?.resumeUrl && (
                                <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs" data-testid={`button-resume-${app._id}`}>
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    Resume
                                  </Button>
                                </a>
                              )}
                              <Select
                                value={app.status}
                                onValueChange={(val) => handleStatusChange(app._id, val)}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs" data-testid={`select-status-${app._id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
