import type {
  ClientDownloadProgress,
  ClientDownloadRepository,
} from './clientDownloadRepository';
import type { OfflineChapterRecord } from './offlineStorage';

export type DeviceDownloadStatus = 'queued' | 'downloading' | 'done' | 'error';

export interface DeviceDownloadRequest {
  readonly chapterId: number;
  readonly mangaId?: number;
  readonly mangaTitle?: string;
  readonly chapterName?: string;
  readonly pageCount?: number;
}

export interface DeviceDownloadJob extends DeviceDownloadRequest {
  readonly status: DeviceDownloadStatus;
  readonly completed: number;
  readonly total: number;
  readonly error: string | null;
  readonly record?: OfflineChapterRecord;
}

export interface DeviceDownloadState {
  readonly jobs: readonly DeviceDownloadJob[];
}

let repository: ClientDownloadRepository | null = null;
let scope = '';
let running = false;
let state: DeviceDownloadState = { jobs: [] };
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

function updateJob(
  chapterId: number,
  patch: Partial<DeviceDownloadJob>,
): void {
  state = {
    jobs: state.jobs.map((job) =>
      job.chapterId === chapterId ? { ...job, ...patch } : job,
    ),
  };
  notify();
}

async function pump(): Promise<void> {
  if (running || !repository) {
    return;
  }

  const job = state.jobs.find((item) => item.status === 'queued');

  if (!job) {
    return;
  }

  running = true;
  updateJob(job.chapterId, {
    status: 'downloading',
    completed: 0,
    total: job.pageCount ?? 0,
    error: null,
  });

  try {
    const current = repository;
    const record = await current.downloadChapter(
      job.chapterId,
      (progress: ClientDownloadProgress) => {
        updateJob(job.chapterId, {
          completed: progress.completedPages,
          total: progress.totalPages,
        });
      },
    );

    if (state.jobs.some((item) => item.chapterId === job.chapterId)) {
      updateJob(job.chapterId, {
        status: 'done',
        completed: record.pageCount,
        total: record.pageCount,
        record,
        error: null,
      });
    }
  } catch (error) {
    if (state.jobs.some((item) => item.chapterId === job.chapterId)) {
      updateJob(job.chapterId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed.',
      });
    }
  } finally {
    running = false;
    void pump();
  }
}

export function configureDeviceDownloads(
  nextRepository: ClientDownloadRepository,
  serverBaseUrl: string,
): void {
  if (scope && scope !== serverBaseUrl) {
    state = { jobs: [] };
    notify();
  }

  scope = serverBaseUrl;
  repository = nextRepository;
  void pump();
}

export function getDeviceDownloadState(): DeviceDownloadState {
  return state;
}

export function subscribeDeviceDownloads(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function enqueueDeviceDownloads(
  requests: readonly DeviceDownloadRequest[],
): void {
  const additions: DeviceDownloadJob[] = [];

  for (const request of requests) {
    const existing = state.jobs.find(
      (job) => job.chapterId === request.chapterId,
    );

    if (existing && existing.status !== 'error' && existing.status !== 'done') {
      continue;
    }

    additions.push({
      ...request,
      status: 'queued',
      completed: 0,
      total: request.pageCount ?? 0,
      error: null,
    });
  }

  if (additions.length === 0) {
    return;
  }

  const byId = new Map(state.jobs.map((job) => [job.chapterId, job]));
  for (const job of additions) {
    byId.set(job.chapterId, job);
  }
  state = { jobs: [...byId.values()] };
  notify();
  void pump();
}

export function removeDeviceDownload(chapterId: number): void {
  if (!state.jobs.some((job) => job.chapterId === chapterId)) {
    return;
  }

  state = { jobs: state.jobs.filter((job) => job.chapterId !== chapterId) };
  notify();
}

export function retryDeviceDownload(chapterId: number): void {
  const job = state.jobs.find((item) => item.chapterId === chapterId);

  if (!job || job.status !== 'error') {
    return;
  }

  updateJob(chapterId, { status: 'queued', completed: 0, error: null });
  void pump();
}

export function clearFinishedDeviceDownloads(): void {
  const jobs = state.jobs.filter(
    (job) => job.status !== 'done' && job.status !== 'error',
  );

  if (jobs.length === state.jobs.length) {
    return;
  }

  state = { jobs };
  notify();
}
