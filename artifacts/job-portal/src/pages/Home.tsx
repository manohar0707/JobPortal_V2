import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useGetJobStats } from "@workspace/api-client-react";
import { Loader2, Briefcase, Building2, Users } from "lucide-react";

export default function Home() {
  const { data: stats, isLoading } = useGetJobStats();

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Find Your Next Big Opportunity
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Discover thousands of jobs, connect with top companies, and advance your career with precision.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/jobs">
                  <Button size="lg" className="h-12 px-8">Browse Jobs</Button>
                </Link>
                <Link href="/companies">
                  <Button variant="outline" size="lg" className="h-12 px-8">Explore Companies</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-center">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="h-12 w-12 text-primary mb-2" />
                    <h2 className="text-4xl font-bold">{stats?.totalJobs || 0}</h2>
                    <p className="text-muted-foreground">Active Jobs</p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Building2 className="h-12 w-12 text-primary mb-2" />
                    <h2 className="text-4xl font-bold">{stats?.totalCompanies || 0}</h2>
                    <p className="text-muted-foreground">Companies Hiring</p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users className="h-12 w-12 text-primary mb-2" />
                    <h2 className="text-4xl font-bold">{stats?.totalApplications || 0}</h2>
                    <p className="text-muted-foreground">Applications Sent</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
