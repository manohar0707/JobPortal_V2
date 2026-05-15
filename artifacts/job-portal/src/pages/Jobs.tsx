import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Loader2, Search, MapPin, Building, Clock, CircleDollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Jobs() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<string>("all");
  
  const [searchParams, setSearchParams] = useState({ keyword: "", location: "", type: "" });

  const { data, isLoading } = useListJobs({
    ...searchParams,
    limit: 50,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      keyword,
      location,
      type: type === "all" ? "" : type,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Jobs</h1>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Job title, skills..." 
                      className="pl-9"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="City, state, remote..." 
                      className="pl-9"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {data?.jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs found matching your criteria.
              </div>
            ) : (
              data?.jobs.map((job) => (
                <Card key={job._id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <Link href={`/jobs/${job._id}`}>
                          <h2 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer">
                            {job.title}
                          </h2>
                        </Link>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Building className="mr-1 h-4 w-4" />
                            {job.company.name}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {job.type.replace("-", " ")}
                          </div>
                          <div className="flex items-center">
                            <CircleDollarSign className="mr-1 h-4 w-4" />
                            {job.salary}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {job.skills?.slice(0, 4).map(skill => (
                            <Badge variant="secondary" key={skill}>{skill}</Badge>
                          ))}
                          {(job.skills?.length || 0) > 4 && (
                            <Badge variant="secondary">+{job.skills!.length - 4} more</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-4">
                        <Link href={`/jobs/${job._id}`}>
                          <Button>View Details</Button>
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(job.createdAt || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
