import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import Trading from "./pages/Trading";
import Configuration from "./pages/Configuration";
import Home from "./pages/Home";
import Login from "./pages/Login";

function Router() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado e tenta acessar rota protegida, vai para login
  // Se está autenticado, pode acessar dashboard

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Login} />
      <Route path="/login" component={Login} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={isAuthenticated ? Dashboard : Login} />
      <Route path="/configuration" component={isAuthenticated ? Configuration : Login} />
      <Route path="/overview" component={isAuthenticated ? Overview : Login} />
      <Route path="/trading" component={isAuthenticated ? Trading : Login} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const bgStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#000000',
    background: `
      radial-gradient(circle at 30% 60%, rgba(0, 255, 157, 0.35) 0%, rgba(0, 184, 255, 0.25) 30%, rgba(0, 0, 0, 0) 65%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 16px,
        rgba(0, 255, 157, 0.12) 16px,
        rgba(0, 255, 157, 0.12) 18px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 16px,
        rgba(255, 255, 255, 0.03) 16px,
        rgba(255, 255, 255, 0.03) 18px
      ),
      linear-gradient(to bottom, #000000, #000000)
    `,
    backgroundAttachment: 'fixed'
  } as React.CSSProperties;

  return (
    <div style={bgStyle}>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
