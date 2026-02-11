/**
 * Job Queue Interna para Experimentos Asíncronos
 * Ejecuta experimentos C-1-RLD en background sin bloquear request lifecycle
 */

interface ExperimentJob {
  experimentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  currentInteraction: number;
  totalInteractions: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  results?: {
    avgOmega: number;
    avgV: number;
    avgH: number;
    avgRLD: number;
    licurgoInterventions: number;
  };
}

// Job queue en memoria
const jobQueue = new Map<string, ExperimentJob>();

export function createJob(experimentId: string, totalInteractions: number): ExperimentJob {
  const job: ExperimentJob = {
    experimentId,
    status: 'pending',
    progress: 0,
    currentInteraction: 0,
    totalInteractions,
    startedAt: new Date(),
  };
  jobQueue.set(experimentId, job);
  return job;
}

export function updateJobProgress(
  experimentId: string,
  currentInteraction: number
): void {
  const job = jobQueue.get(experimentId);
  if (!job) return;

  job.currentInteraction = currentInteraction;
  job.progress = Math.floor((currentInteraction / job.totalInteractions) * 100);
  job.status = 'running';
}

export function completeJob(
  experimentId: string,
  results: ExperimentJob['results']
): void {
  const job = jobQueue.get(experimentId);
  if (!job) return;

  job.status = 'completed';
  job.progress = 100;
  job.completedAt = new Date();
  job.results = results;
}

export function failJob(experimentId: string, error: string): void {
  const job = jobQueue.get(experimentId);
  if (!job) return;

  job.status = 'failed';
  job.completedAt = new Date();
  job.error = error;
}

export function getJob(experimentId: string): ExperimentJob | undefined {
  return jobQueue.get(experimentId);
}

export function getAllJobs(): ExperimentJob[] {
  return Array.from(jobQueue.values());
}
