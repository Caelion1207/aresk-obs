import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SessionReplay from "./pages/SessionReplay";
import Lab from "./pages/Lab";
import Simulator from "./pages/Simulator";
import Architecture from "./pages/Architecture";
import Modules from "./pages/Modules";
import Protocols from "./pages/Protocols";
import Proposals from "./pages/Proposals";
import Statistics from "./pages/Statistics";
import CompareHistorical from "./pages/CompareHistorical";
import ErosionDashboard from "./pages/ErosionDashboard";
import { CyclesDashboard } from "./pages/CyclesDashboard";
import { SystemHealth } from "./pages/SystemHealth";
import { CoreDashboard } from "./pages/CoreDashboard";
import ExperimentoEstabilidad from "./pages/ExperimentoEstabilidad";
import ExperimentoComparar from './pages/ExperimentoComparar';
import SystemFlow from './pages/SystemFlow';

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/simulator"} component={Simulator} />
      <Route path={"/lab"} component={Lab} />
      <Route path={"/replay/:sessionId"} component={SessionReplay} />
      <Route path={"/architecture"} component={Architecture} />
      <Route path={"/modules"} component={Modules} />
      <Route path={"/protocols"} component={Protocols} />
      <Route path={"/proposals"} component={Proposals} />
      <Route path={"/estadisticas"} component={Statistics} />
      <Route path={"/comparar-sesiones"} component={CompareHistorical} />
      <Route path={"/erosion"} component={ErosionDashboard} />
      <Route path={"/cycles"} component={CyclesDashboard} />
      <Route path={"/health"} component={SystemHealth} />
      <Route path={"/core"} component={CoreDashboard} />
      <Route path={"/experimento/estabilidad"} component={ExperimentoEstabilidad} />
        <Route path="/experimento/comparar" component={ExperimentoComparar} />
        <Route path="/sistema/flujo" component={SystemFlow} />
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
