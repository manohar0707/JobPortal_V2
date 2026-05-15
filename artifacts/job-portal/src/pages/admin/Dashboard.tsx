import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Loader2, Users, Briefcase, Building2, FileText, UserCheck, UserX } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and management</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
                  { label: "Job Seekers", value: stats?.totalSeekers ?? 0, icon: UserCheck, color: "text-green-500" },
                  { label: "Recruiters", value: stats?.totalRecruiters ?? 0, icon: UserX, color: "text-blue-500" },
                  { label: "Active Jobs", value: stats?.totalJobs ?? 0, icon: Briefcase, color: "text-yellow-500" },
                  { label: "Companies", value: stats?.totalCompanies ?? 0, icon: Building2, color: "text-purple-500" },
                  { label: "Applications", value: stats?.totalApplications ?? 0, icon: FileText, color: "text-orange-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <Card key={label} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{label}</p>
                          <p className="text-3xl font-bold mt-1" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</p>
                        </div>
                        <Icon className={`h-8 w-8 opacity-80 ${color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full h-12" data-testid="button-manage-users">
                    <Users className="h-4 w-4 mr-2" />Manage Users
                  </Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button variant="outline" className="w-full h-12" data-testid="button-manage-jobs">
                    <Briefcase className="h-4 w-4 mr-2" />Manage Jobs
                  </Button>
                </Link>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {!stats?.recentActivity?.length ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {stats.recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3" data-testid={`row-activity-${i}`}>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                            <p className="text-sm">{item.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-4">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
