import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebShell } from "@/components/WebShell";
import Landing from "@/pages/Landing";
import Jobs from "@/pages/Jobs";
import Mentors from "@/pages/Mentors";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <WebShell>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/mentors" component={Mentors} />
        <Route component={NotFound} />
      </Switch>
    </WebShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
