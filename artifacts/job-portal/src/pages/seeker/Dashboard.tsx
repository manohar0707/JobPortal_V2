import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMyApplications, useGetJobStats } from "@workspace/api-client-react";
import { Loader2, Briefcase, CheckCircle, Clock, XCircle, User, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function SeekerDashboard() {
  const { user } = useAuth();
  const { data: applications, isLoading } = useGetMyApplications();

  const total = applications?.length ?? 0;
  const pending = applications?.filter((a) => a.status === "pending").length ?? 0;
  const shortlisted = applications?.filter((a) => a.status === "shortlisted").length ?? 0;
  const accepted = applications?.filter((a) => a.status === "accepted").length ?? 0;

  return (
    <ProtectedRoute allowedRoles={["seeker"]}>
      <Layout>
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName}</h1>
            <p className="text-muted-foreground mt-1">Track your job applications and career progress</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applied</p>
                    <p className="text-3xl font-bold mt-1">{total}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold mt-1">{pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Shortlisted</p>
                    <p className="text-3xl font-bold mt-1">{shortlisted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <p className="text-3xl font-bold mt-1">{accepted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mb-8">
            <Link href="/jobs">
              <Button data-testid="button-browse-jobs">Browse Jobs</Button>
            </Link>
            <Link href="/seeker/profile">
              <Button variant="outline" data-testid="button-edit-profile">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !applications?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No applications yet.</p>
                  <Link href="/jobs"><Button variant="link" className="mt-1">Browse jobs</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app._id} className="flex items-center justify-between py-3" data-testid={`row-application-${app._id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{(app.job as any)?.title ?? "Job"}</p>
                        <p className="text-xs text-muted-foreground truncate">{(app.job as any)?.company?.name ?? ""}</p>
                      </div>
                      <Badge className={`ml-4 text-xs capitalize border ${statusColors[app.status] ?? ""}`} data-testid={`status-${app._id}`}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {(applications?.length ?? 0) > 5 && (
                <div className="mt-3 text-right">
                  <Link href="/seeker/applications">
                    <Button variant="link" size="sm" className="text-xs">View all applications <ChevronRight className="h-3 w-3 ml-1" /></Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
