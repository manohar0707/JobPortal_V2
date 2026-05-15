import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Companies from "@/pages/Companies";

import SeekerDashboard from "@/pages/seeker/Dashboard";
import SeekerApplications from "@/pages/seeker/Applications";
import SeekerProfile from "@/pages/seeker/Profile";

import RecruiterDashboard from "@/pages/recruiter/Dashboard";
import RecruiterJobs from "@/pages/recruiter/Jobs";
import JobFormPage from "@/pages/recruiter/JobForm";
import Applicants from "@/pages/recruiter/Applicants";
import RecruiterCompanies from "@/pages/recruiter/Companies";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminJobs from "@/pages/admin/Jobs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/companies" component={Companies} />

      <Route path="/seeker/dashboard" component={SeekerDashboard} />
      <Route path="/seeker/applications" component={SeekerApplications} />
      <Route path="/seeker/profile" component={SeekerProfile} />

      <Route path="/recruiter/dashboard" component={RecruiterDashboard} />
      <Route path="/recruiter/jobs" component={RecruiterJobs} />
      <Route path="/recruiter/jobs/new" component={() => <JobFormPage />} />
      <Route path="/recruiter/jobs/:id/edit">
        {(params) => <JobFormPage jobId={params.id} />}
      </Route>
      <Route path="/recruiter/jobs/:id/applicants">
        {(params) => <Applicants jobId={params.id!} />}
      </Route>
      <Route path="/recruiter/companies" component={RecruiterCompanies} />

      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/jobs" component={AdminJobs} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
