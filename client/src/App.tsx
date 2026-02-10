import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ComparacionExperimentos from "./pages/ComparacionExperimentos";
import DynamicsMonitor from "./pages/DynamicsMonitor";

import ResearchPage from '@/pages/ResearchPage';
import CampoPage from '@/pages/CampoPage';
import MarcoPage from '@/pages/MarcoPage';
import InstrumentoPage from '@/pages/InstrumentoPage';
import CoreDashboard from '@/pages/CoreDashboard';
import CaelionHistory from '@/pages/CaelionHistory';
import CaelionSessionDetail from '@/pages/CaelionSessionDetail';

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/experimento/comparacion"} component={ComparacionExperimentos} />
      <Route path={"/experimento/dynamics"} component={DynamicsMonitor} />
      <Route path={"/core"} component={CoreDashboard} />
      <Route path={"/caelion/history"} component={CaelionHistory} />
      <Route path={"/caelion/session/:sessionId"} component={CaelionSessionDetail} />

      <Route path="/investigacion" component={ResearchPage} />
      <Route path="/campo" component={CampoPage} />
      <Route path="/marco" component={MarcoPage} />
      <Route path="/instrumento" component={InstrumentoPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
