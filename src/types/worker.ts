export interface WorkerMessage {
  agentId: string;
  currentTask?: string;
  position?: {
    x: number;
    y: number;
  };
  status?: string;
  // 추가 필요한 필드들
}
