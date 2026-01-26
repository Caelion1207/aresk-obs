import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ExperimentoEstabilidad from "./pages/ExperimentoEstabilidad";
import SystemFlow from '@/pages/SystemFlow';
import { HUDMetrics } from '@/pages/HUDMetrics';
import ResearchPage from '@/pages/ResearchPage';
import CampoPage from '@/pages/CampoPage';
import MarcoPage from '@/pages/MarcoPage';
import InstrumentoPage from '@/pages/InstrumentoPage';

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/experimento/estabilidad"} component={ExperimentoEstabilidad} />
      <Route path="/sistema/flujo" component={SystemFlow} />
      <Route path="/metricas/hud" component={HUDMetrics} />
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
