import React, { useEffect, useRef, useState } from "react";
import phaserGame from "./PhaserGame";
import SocketService from "./services/SocketService";
import GameScene from "./scenes/GameScene";
import type { WorkerMessage } from "./types/worker";

function App() {
  const gameRef = useRef<HTMLDivElement>(null);
  const socketServiceRef = useRef<SocketService | null>(null);
  const gameSceneRef = useRef<GameScene | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameReady, setGameReady] = useState(false);

  const userId = "test"; // 실제로는 props나 context에서 받아올 수 있습니다

  useEffect(() => {
    let mounted = true;

    const initializeGame = () => {
      // Phaser 게임 컨테이너 설정
      if (gameRef.current && mounted) {
        // 기존 canvas 제거
        gameRef.current.innerHTML = "";

        // Phaser 게임 canvas 추가
        if (phaserGame.canvas) {
          gameRef.current.appendChild(phaserGame.canvas);
        }

        // GameScene이 ready될 때까지 대기
        const checkScene = () => {
          if (!mounted) return;

          const scene = phaserGame.scene.getScene("GameScene") as GameScene;
          if (scene && scene.scene) {
            gameSceneRef.current = scene;
            setGameReady(true);

            // Socket 서비스 초기화
            if (!socketServiceRef.current && mounted) {
              socketServiceRef.current = new SocketService(userId);
            }
          } else {
            setTimeout(checkScene, 100);
          }
        };

        // 씬이 시작될 때까지 대기
        setTimeout(checkScene, 500);
      }
    };

    initializeGame();

    // 연결 상태 체크
    const checkConnection = () => {
      setIsConnected(socketServiceRef.current?.isConnected() ?? false);
    };

    const interval = setInterval(checkConnection, 1000);

    // 컴포넌트 언마운트 시 정리
    return () => {
      mounted = false;
      clearInterval(interval);
      if (socketServiceRef.current) {
        socketServiceRef.current.disconnect();
      }
    };
  }, [userId]);

  // onWorkerUpdate 콜백 등록을 별도 useEffect로 분리
  useEffect(() => {
    if (socketServiceRef.current && gameReady) {
      const callback = (message: WorkerMessage) => {
        if (gameSceneRef.current && gameReady) {
          gameSceneRef.current.updateWorker(message);
        }
      };
      socketServiceRef.current.onWorkerUpdate(callback);
      // cleanup: 필요시 콜백 해제 로직 추가 가능
      return () => {
        // 콜백 해제 로직이 필요하다면 여기에 작성
        // (현재 구조에서는 필요 없음)
      };
    }
  }, [gameReady]);

  // 테스트용 워커 생성 함수들 - gameReady 체크 추가
  const createTestWorker = (agentId: string, task: string) => {
    if (!gameReady || !gameSceneRef.current) {
      console.warn("Game scene is not ready yet");
      return;
    }

    const message: WorkerMessage = {
      agentId,
      currentTask: task,
      position: {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
      },
      status: "working",
    };
    gameSceneRef.current.updateWorker(message);
  };

  const updateWorkerPosition = (agentId: string) => {
    if (!gameReady || !gameSceneRef.current) {
      console.warn("Game scene is not ready yet");
      return;
    }

    const message: WorkerMessage = {
      agentId,
      position: {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
      },
    };
    gameSceneRef.current.updateWorker(message);
  };

  const removeTestWorker = (agentId: string) => {
    if (!gameReady || !gameSceneRef.current) {
      console.warn("Game scene is not ready yet");
      return;
    }
    gameSceneRef.current.removeWorker(agentId);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <div
        id="phaser-container"
        ref={gameRef}
        style={{ width: "100%", height: "100%" }}
      />

      {/* UI 오버레이 (필요한 경우) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          background: "rgba(0,0,0,0.8)",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        <div>User ID: {userId}</div>
        <div>Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</div>
        <div>Game: {gameReady ? "🟢 Ready" : "🔴 Loading..."}</div>
      </div>

      {/* 테스트용 컨트롤 패널 */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.8)",
          padding: "15px",
          borderRadius: "5px",
          zIndex: 1000,
        }}
      >
        <h4 style={{ color: "white", margin: "0 0 10px 0", fontSize: "14px" }}>
          Worker Test Controls {!gameReady && "(Loading...)"}
        </h4>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => createTestWorker("naver-ai", "네이버 검색 중...")}
            style={{ ...buttonStyle, opacity: gameReady ? 1 : 0.5 }}
            disabled={!gameReady}
          >
            Add Naver AI
          </button>
          <button
            onClick={() =>
              createTestWorker("tistory-ai", "티스토리 포스팅 중...")
            }
            style={{ ...buttonStyle, opacity: gameReady ? 1 : 0.5 }}
            disabled={!gameReady}
          >
            Add Tistory AI
          </button>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => createTestWorker("google-ai", "구글 분석 중...")}
            style={{ ...buttonStyle, opacity: gameReady ? 1 : 0.5 }}
            disabled={!gameReady}
          >
            Add Google AI
          </button>
          <button
            onClick={() => createTestWorker("openai-ai", "AI 답변 생성 중...")}
            style={{ ...buttonStyle, opacity: gameReady ? 1 : 0.5 }}
            disabled={!gameReady}
          >
            Add OpenAI
          </button>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => updateWorkerPosition("naver-ai")}
            style={{ ...buttonStyle, opacity: gameReady ? 1 : 0.5 }}
            disabled={!gameReady}
          >
            Move Naver
          </button>
          <button
            onClick={() => updateWorkerPosition("tistory-ai")}
            style={{ ...buttonStyle, opacity: gameReady ? 1 : 0.5 }}
            disabled={!gameReady}
          >
            Move Tistory
          </button>
        </div>

        <div>
          <button
            onClick={() => removeTestWorker("naver-ai")}
            style={{
              ...buttonStyle,
              backgroundColor: "#dc3545",
              opacity: gameReady ? 1 : 0.5,
            }}
            disabled={!gameReady}
          >
            Remove Naver
          </button>
          <button
            onClick={() => removeTestWorker("tistory-ai")}
            style={{
              ...buttonStyle,
              backgroundColor: "#dc3545",
              opacity: gameReady ? 1 : 0.5,
            }}
            disabled={!gameReady}
          >
            Remove Tistory
          </button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "5px 8px",
  margin: "2px",
  fontSize: "11px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};

export default App;
