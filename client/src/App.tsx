import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ComparativeView from "./pages/ComparativeView";
import Simulator from "./pages/Simulator";
import Architecture from "./pages/Architecture";
import Modules from "./pages/Modules";
import Protocols from "./pages/Protocols";
import Proposals from "./pages/Proposals";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/simulator"} component={Simulator} />
      <Route path={"/comparativa"} component={ComparativeView} />
      <Route path={"/architecture"} component={Architecture} />
      <Route path={"/modules"} component={Modules} />
      <Route path={"/protocols"} component={Protocols} />
      <Route path={"/proposals"} component={Proposals} />
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
