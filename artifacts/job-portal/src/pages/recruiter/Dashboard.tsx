import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMyJobs, useGetMyCompanies } from "@workspace/api-client-react";
import { Loader2, Briefcase, Building2, Users, Plus, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data: jobs, isLoading: jobsLoading } = useGetMyJobs();
  const { data: companies, isLoading: companiesLoading } = useGetMyCompanies();

  const totalJobs = jobs?.length ?? 0;
  const activeJobs = jobs?.filter((j) => j.isActive).length ?? 0;
  const totalApplicants = jobs?.reduce((sum, j) => sum + (j.applicantsCount ?? 0), 0) ?? 0;

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <Layout>
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, {user?.fullName}</h1>
            <p className="text-muted-foreground mt-1">Manage your job postings and find the best candidates</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                    <p className="text-3xl font-bold mt-1">{totalJobs}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applicants</p>
                    <p className="text-3xl font-bold mt-1">{totalApplicants}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Companies</p>
                    <p className="text-3xl font-bold mt-1">{companies?.length ?? 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mb-8">
            <Link href="/recruiter/jobs/new">
              <Button data-testid="button-post-job">
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </Link>
            <Link href="/recruiter/companies">
              <Button variant="outline" data-testid="button-manage-companies">Manage Companies</Button>
            </Link>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Job Postings</CardTitle>
              <Link href="/recruiter/jobs">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !jobs?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No jobs posted yet.</p>
                  <Link href="/recruiter/jobs/new">
                    <Button variant="link" className="mt-1">Post your first job</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job._id} className="flex items-center justify-between py-3" data-testid={`row-job-${job._id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.location} · {job.type}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-xs text-muted-foreground">{job.applicantsCount ?? 0} applicants</span>
                        <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                          {job.isActive ? "Active" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
