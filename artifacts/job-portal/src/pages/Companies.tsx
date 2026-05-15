import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useListCompanies, getListCompaniesQueryKey } from "@workspace/api-client-react";
import { Loader2, Building2, MapPin, Globe, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const params = { search: query || undefined, page, limit: 12 };
  const { data, isLoading } = useListCompanies(params, { query: { queryKey: getListCompaniesQueryKey(params) } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  return (
    <Layout>
      <div className="container max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Companies Hiring</h1>
          <p className="text-muted-foreground">Discover great companies and explore opportunities</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="pl-9"
              data-testid="input-search-companies"
            />
          </div>
          <Button type="submit" data-testid="button-search">Search</Button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !data?.companies?.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No companies found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.companies.map((company) => (
                <Card key={company._id} className="bg-card border-border hover:border-primary/40 transition-colors" data-testid={`card-company-${company._id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate" data-testid={`text-company-name-${company._id}`}>{company.name}</h3>
                        {company.industry && (
                          <Badge variant="secondary" className="text-xs mt-1">{company.industry}</Badge>
                        )}
                      </div>
                    </div>
                    {company.description && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{company.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {company.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>}
                      {company.size && <span>{company.size} employees</span>}
                    </div>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                        data-testid={`link-company-website-${company._id}`}
                      >
                        <Globe className="h-3 w-3" />Visit website
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <p className="text-sm text-muted-foreground">{data.total} companies · Page {data.page} of {data.pages}</p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
