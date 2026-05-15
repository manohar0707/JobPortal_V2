import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetMyApplications } from "@workspace/api-client-react";
import { Loader2, Briefcase, MapPin, Clock, Building2 } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function SeekerApplications() {
  const { data: applications, isLoading } = useGetMyApplications();

  return (
    <ProtectedRoute allowedRoles={["seeker"]}>
      <Layout>
        <div className="container max-w-4xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground mt-1">{applications?.length ?? 0} applications total</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !applications?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No applications yet</p>
              <p className="text-sm mt-1">Start applying to jobs to track them here</p>
              <Link href="/jobs"><Button className="mt-4">Browse Jobs</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const job = app.job as any;
                return (
                  <Card key={app._id} className="bg-card border-border" data-testid={`card-application-${app._id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/jobs/${job?._id}`}>
                              <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid={`text-job-title-${app._id}`}>
                                {job?.title ?? "Job"}
                              </h3>
                            </Link>
                            <Badge className={`text-xs capitalize border ${statusColors[app.status] ?? ""}`} data-testid={`badge-status-${app._id}`}>
                              {app.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            {job?.company?.name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {job.company.name}
                              </span>
                            )}
                            {job?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Applied {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {app.coverLetter && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{app.coverLetter}</p>
                          )}
                        </div>
                        {job?.salary && (
                          <span className="text-sm font-medium text-primary shrink-0">{job.salary}</span>
                        )}
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
