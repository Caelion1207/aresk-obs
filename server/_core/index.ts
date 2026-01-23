import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { validateSchemaOnStartup } from "../db/validateSchema";
import { startIntegrityCheckJob } from "../infra/jobs/integrityCheck";
import { startArgosObserver } from "../services/argos";
import { startWabunObserver } from "../services/wabun";
import { preloadBucefaloCache } from "../services/embeddings";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Validar esquema de base de datos al inicio
  console.log("[STARTUP] Running schema validation...");
  try {
    await validateSchemaOnStartup();
    console.log("[STARTUP] Schema validation passed");
  } catch (error: any) {
    console.error("[STARTUP] Schema validation failed:", error.message);
    console.error("[STARTUP] Server cannot start. Fix schema issues and restart.");
    process.exit(1);
  }
  
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    console.log('🛡️ Core System Secured. Initializing Sidecars...');
    
    // 1. PRECARGA DE CACHÉ DE BUCÉFALO
    // Cachear embedding de referencia ética para reducir latencia en ~50%
    const bucefaloPurpose = "Asistir con precisión, transparencia y respeto a los límites éticos establecidos.";
    try {
      await preloadBucefaloCache(bucefaloPurpose);
    } catch (error) {
      console.error('⚠️ Error al precargar caché de Bucéfalo:', error);
    }
    
    // 2. INICIALIZACIÓN DE OBSERVADORES (Orden Estricto)
    // A. ARGOS (Economía): Debe estar listo para calcular el precio.
    startArgosObserver();
    
    // B. WABUN (Semántica): Depende conceptualmente de la economía.
    startWabunObserver();
    
    // Iniciar job de verificación de integridad
    startIntegrityCheckJob();
  });
}

startServer().catch(console.error);
