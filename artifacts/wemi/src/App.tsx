import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileShell } from "@/components/MobileShell";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Jobs from "@/pages/Jobs";
import Mentors from "@/pages/Mentors";
import MentoringApply from "@/pages/MentoringApply";
import Me from "@/pages/Me";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const NO_TABS = ["/login", "/signup"];

function Router() {
  const [location] = useLocation();
  const showTabs = !NO_TABS.some((p) => location === p) && !location.startsWith("/mentors/");

  return (
    <MobileShell showTabs={showTabs}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/mentors" component={Mentors} />
        <Route path="/mentors/:id/apply" component={MentoringApply} />
        <Route path="/me" component={Me} />
        <Route component={NotFound} />
      </Switch>
    </MobileShell>
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
