declare module 'throng' {
  export interface ThrongOptions {
    workers?: number;
    lifetime?: number;
    grace?: number;
    signals?: string[];
    start: WorkerFunction;
  }

  export type WorkerFunction = (id: number) => void | Promise<void>;

  function throng(options: ThrongOptions): void;
  function throng(workers: number, start: WorkerFunction): void;
  function throng(start: WorkerFunction): void;

  export default throng;
} 