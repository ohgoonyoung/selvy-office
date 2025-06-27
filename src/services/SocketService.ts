import { io, Socket } from "socket.io-client";
import type { WorkerMessage } from "../types/worker";

export default class SocketService {
  private socket: Socket;
  private userId: string;
  private onWorkerUpdateCallback?: (message: WorkerMessage) => void;
  private agentPositions: Record<string, { x: number; y: number }> = {
    "naver-ai": { x: 900, y: 100 },
    "tistory-ai": { x: 800, y: 200 },
  };

  constructor(userId: string) {
    this.userId = userId;
    this.socket = io("wss://fitness-api-dev.itgoon.net/selvy", {
      path: "/selvy/socket.io",
      transports: ["websocket"],
      forceNew: true,
      reconnectionAttempts: 3,
      timeout: 10000,
      query: {
        email: "admin@selvy.co.kr",
      },
    });
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on("connect", () => {
      console.log("Connected to server");
      // userId 기반으로 채널 조인
      this.joinChannel();
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("worker-status", (message: WorkerMessage) => {
      // agentId별로 최초 한 번만 랜덤 좌표를 생성해 저장하고, 이후 동일 agentId에는 같은 좌표 사용
      if (!("position" in message)) {
        if (message.agentId) {
          if (!this.agentPositions[message.agentId]) {
            this.agentPositions[message.agentId] = {
              x: Math.random() * 600 + 100,
              y: Math.random() * 400 + 100,
            };
          }
          message.position = this.agentPositions[message.agentId];
        } else {
          // agentId가 없으면 그냥 랜덤
          message.position = {
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
          };
        }
      }
      if (this.onWorkerUpdateCallback) {
        this.onWorkerUpdateCallback(message);
      }
    });

    this.socket.on("error", (error: Error) => {
      console.error("Socket error:", error);
    });
  }

  private joinChannel() {
    this.socket.emit("join", { userId: this.userId });
    console.log(`Joined channel for user: ${this.userId}`);
  }

  public onWorkerUpdate(callback: (message: WorkerMessage) => void) {
    this.onWorkerUpdateCallback = callback;
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}
