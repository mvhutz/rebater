interface IdleStatus {
  type: "idle";
}

interface DoneStatus {
  type: "done";
  results: RunResults;
}

interface ErrorStatus {
  type: "error";
  message?: string;
}

interface LoadingStatus {
  type: "loading";
  message?: string;
}

interface RunningStatus {
  type: "running";
  progress: number;
}

interface AskStatus {
  type: "asking";
  question: string;
}

export type SystemStatus = IdleStatus | RunningStatus | DoneStatus | ErrorStatus | LoadingStatus | AskStatus;