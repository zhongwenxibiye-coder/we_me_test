import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebShell } from "@/components/WebShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { initSupabase } from "@/lib/supabase";
import Landing from "@/pages/Landing";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Mentors from "@/pages/Mentors";
import MentorDetail from "@/pages/MentorDetail";
import ArticleDetail from "@/pages/ArticleDetail";
import MentorApply from "@/pages/MentorApply";
import Admin from "@/pages/Admin";
import CareerMatchPage from "@/pages/CareerMatch";
import StartupResult from "@/pages/StartupResult";
import CreativeSpace from "@/pages/CreativeSpace";
import CreativeEpisode from "@/pages/CreativeEpisode";
import HumanitiesContent from "@/pages/HumanitiesContent";
import HumanitiesArticle from "@/pages/HumanitiesArticle";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Community from "@/pages/Community";
import MyPage from "@/pages/MyPage";
import { CareerMatchingPage, ProjectsPage } from "@/pages/ComingSoon";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <WebShell>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/community" component={Community} />
        <Route path="/mypage" component={MyPage} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/mentors" component={Mentors} />
        <Route path="/mentors/:id/articles/:articleId" component={ArticleDetail} />
        <Route path="/mentors/:id/apply" component={MentorApply} />
        <Route path="/mentors/:id" component={MentorDetail} />
        <Route path="/career-match/result/:id" component={StartupResult} />
        <Route path="/career-match" component={CareerMatchPage} />
        <Route path="/career-matching" component={CareerMatchingPage} />
        <Route path="/creative-space/:workId/episodes/:episodeId" component={CreativeEpisode} />
        <Route path="/creative-space" component={CreativeSpace} />
        <Route path="/humanities/articles/:id" component={HumanitiesArticle} />
        <Route path="/humanities" component={HumanitiesContent} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </WebShell>
  );
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/config`)
      .then((r) => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }: { supabaseUrl: string; supabaseAnonKey: string }) => {
        if (supabaseUrl && supabaseAnonKey) initSupabase(supabaseUrl, supabaseAnonKey);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
