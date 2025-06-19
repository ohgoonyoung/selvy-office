import Phaser from "phaser";
import type { WorkerMessage } from "../types/worker";

export default class GameScene extends Phaser.Scene {
  private workers: Map<string, Phaser.GameObjects.Container> = new Map();
  private workerNames: Map<string, Phaser.GameObjects.Text> = new Map();
  private workerMessages: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // 캐릭터 스프라이트 로드
    this.load.spritesheet("adam", "/assets/character/adam.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("lucy", "/assets/character/lucy.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("ash", "/assets/character/ash.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("nancy", "/assets/character/nancy.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    // 오피스 타일맵 및 타일셋 로드
    this.load.tilemapTiledJSON("tilemap", "/assets/map/map.json");
    this.load.spritesheet("tiles_wall", "/assets/map/FloorAndGround.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "office",
      "/assets/tileset/Modern_Office_Black_Shadow.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    // 추가 타일셋 로드
    this.load.spritesheet("generic", "/assets/tileset/Generic.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("basement", "/assets/tileset/Basement.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 아이템 스프라이트시트 로드
    this.load.spritesheet("chairs", "/assets/items/chair.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet("computers", "/assets/items/computer.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet("whiteboards", "/assets/items/whiteboard.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "vendingmachines",
      "/assets/items/vendingmachine.png",
      {
        frameWidth: 48,
        frameHeight: 72,
      }
    );
  }

  create() {
    // 배경 설정 - 더 밝은 색상으로 변경
    this.cameras.main.setBackgroundColor("#4a90e2");

    const roomX = 620;
    const roomY = 20;
    const roomWidth = 450;
    const roomHeight = 300;

    this.cameras.main.setBounds(roomX, roomY, roomWidth, roomHeight);
    this.cameras.main.setViewport(0, 0, roomWidth, roomHeight);
    this.cameras.main.centerOn(roomX + roomWidth / 2, roomY + roomHeight / 2);

    // 오피스 타일맵 생성
    const map = this.make.tilemap({ key: "tilemap" });
    const tilesWall = map.addTilesetImage("FloorAndGround", "tiles_wall");
    const officeTiles = map.addTilesetImage(
      "Modern_Office_Black_Shadow",
      "office"
    );
    const genericTiles = map.addTilesetImage("Generic", "generic");
    const basementTiles = map.addTilesetImage("Basement", "basement");

    // 레이어 생성 (Ground, Objects 등)
    if (tilesWall) {
      map.createLayer("Ground", tilesWall);
      map.createLayer("Wall", tilesWall);
    }
    if (officeTiles) {
      map.createLayer("Objects", officeTiles);
      map.createLayer("ObjectsOnCollide", officeTiles);
    }
    if (genericTiles) {
      map.createLayer("GenericObjects", genericTiles);
      map.createLayer("GenericObjectsOnCollide", genericTiles);
    }
    if (basementTiles) {
      map.createLayer("Basement", basementTiles);
    }

    // 아이템 그룹 생성
    const chairs = this.physics.add.staticGroup();
    const computers = this.physics.add.staticGroup();
    const whiteboards = this.physics.add.staticGroup();
    const vendingMachines = this.physics.add.staticGroup();
    const genericObjects = this.physics.add.staticGroup();

    // 맵에서 아이템 객체 레이어 가져오기
    const chairLayer = map.getObjectLayer("Chair");
    const computerLayer = map.getObjectLayer("Computer");
    const whiteboardLayer = map.getObjectLayer("Whiteboard");
    const vendingMachineLayer = map.getObjectLayer("VendingMachine");
    const genericLayer = map.getObjectLayer("GenericObjects");

    // 아이템 객체 생성
    if (chairLayer && chairLayer.objects) {
      chairLayer.objects.forEach((chairObj) => {
        const x = chairObj.x! + chairObj.width! * 0.5;
        const y = chairObj.y! - chairObj.height! * 0.5;
        const chairTileset = map.getTileset("chair");
        if (chairTileset) {
          chairs.create(x, y, "chairs", chairObj.gid! - chairTileset.firstgid);
        }
      });
    }

    if (computerLayer && computerLayer.objects) {
      computerLayer.objects.forEach((obj) => {
        const x = obj.x! + obj.width! * 0.5;
        const y = obj.y! - obj.height! * 0.5;
        const computerTileset = map.getTileset("computer");
        if (computerTileset) {
          computers.create(
            x,
            y,
            "computers",
            obj.gid! - computerTileset.firstgid
          );
        }
      });
    }

    if (whiteboardLayer && whiteboardLayer.objects) {
      whiteboardLayer.objects.forEach((obj) => {
        const x = obj.x! + obj.width! * 0.5;
        const y = obj.y! - obj.height! * 0.5;
        const whiteboardTileset = map.getTileset("whiteboard");
        if (whiteboardTileset) {
          whiteboards.create(
            x,
            y,
            "whiteboards",
            obj.gid! - whiteboardTileset.firstgid
          );
        }
      });
    }

    if (vendingMachineLayer && vendingMachineLayer.objects) {
      vendingMachineLayer.objects.forEach((obj) => {
        const x = obj.x! + obj.width! * 0.5;
        const y = obj.y! - obj.height! * 0.5;
        const vendingMachineTileset = map.getTileset("vendingmachine");
        if (vendingMachineTileset) {
          vendingMachines.create(
            x,
            y,
            "vendingmachines",
            obj.gid! - vendingMachineTileset.firstgid
          );
        }
      });
    }

    // Generic 오브젝트 생성
    if (genericLayer && genericLayer.objects) {
      genericLayer.objects.forEach((obj) => {
        const x = obj.x! + obj.width! * 0.5;
        const y = obj.y! - obj.height! * 0.5;
        const genericTileset = map.getTileset("Generic");
        if (genericTileset) {
          genericObjects.create(
            x,
            y,
            "generic",
            obj.gid! - genericTileset.firstgid
          );
        }
      });
    }

    // 게임 월드 크기 설정
    this.physics.world.setBounds(0, 0, 800, 600);

    // 캐릭터 애니메이션 생성
    this.createCharacterAnimations();

    console.log("GameScene created successfully");
  }

  private createCharacterAnimations() {
    const characters = ["adam", "lucy", "ash", "nancy"];
    const animsFrameRate = 15;

    characters.forEach((character) => {
      // 아래쪽 보기 (기본)
      this.anims.create({
        key: `${character}_idle_down`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 18,
          end: 23,
        }),
        frameRate: animsFrameRate * 0.6,
        repeat: -1,
      });

      // 위쪽 보기
      this.anims.create({
        key: `${character}_idle_up`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 6,
          end: 11,
        }),
        frameRate: animsFrameRate * 0.6,
        repeat: -1,
      });

      // 좌우 보기
      this.anims.create({
        key: `${character}_idle_left`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 12,
          end: 17,
        }),
        frameRate: animsFrameRate * 0.6,
        repeat: -1,
      });

      // 정면 보기
      this.anims.create({
        key: `${character}_idle_right`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 0,
          end: 5,
        }),
        frameRate: animsFrameRate * 0.6,
        repeat: -1,
      });

      // 아래쪽 보기 (기본)
      this.anims.create({
        key: `${character}_run_down`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 42,
          end: 47,
        }),
        frameRate: animsFrameRate,
        repeat: -1,
      });

      // 위쪽 보기
      this.anims.create({
        key: `${character}_run_up`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 30,
          end: 35,
        }),
        frameRate: animsFrameRate,
        repeat: -1,
      });

      // 좌우 보기
      this.anims.create({
        key: `${character}_run_left`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 36,
          end: 41,
        }),
        frameRate: animsFrameRate,
        repeat: -1,
      });

      // 정면 보기
      this.anims.create({
        key: `${character}_run_right`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 24,
          end: 29,
        }),
        frameRate: animsFrameRate,
        repeat: -1,
      });

      // 아래쪽 보기 (기본)
      this.anims.create({
        key: `${character}_sit_down`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 48,
          end: 48,
        }),
        frameRate: animsFrameRate,
        repeat: 0,
      });

      // 위쪽 보기
      this.anims.create({
        key: `${character}_sit_left`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 49,
          end: 49,
        }),
        frameRate: animsFrameRate,
        repeat: 0,
      });

      // 좌우 보기
      this.anims.create({
        key: `${character}_sit_right`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 50,
          end: 50,
        }),
        frameRate: animsFrameRate,
        repeat: 0,
      });

      // 정면 보기
      this.anims.create({
        key: `${character}_sit_up`,
        frames: this.anims.generateFrameNumbers(character, {
          start: 51,
          end: 51,
        }),
        frameRate: animsFrameRate,
        repeat: 0,
      });
    });
  }

  // 워커 업데이트 메서드
  updateWorker(workerData: WorkerMessage) {
    if (!this.scene.isActive()) {
      console.warn("Scene is not active");
      return;
    }

    const { agentId, currentTask } = workerData;

    // 기존 워커가 있으면 업데이트, 없으면 생성
    if (this.workers.has(agentId)) {
      this.updateExistingWorker(agentId, workerData);
    } else {
      this.createNewWorker(agentId, workerData);
    }

    // 캐릭터 메시지 박스 업데이트
    this.updateWorkerMessage(agentId, currentTask);
  }

  private createNewWorker(agentId: string, workerData: WorkerMessage) {
    if (!this.scene.isActive()) return;

    // 기존 워커가 있으면 제거
    if (this.workers.has(agentId)) {
      this.removeWorker(agentId);
    }

    const { position } = workerData;
    const x = position?.x ?? 100;
    const y = position?.y ?? 100;

    try {
      // 워커 컨테이너 생성
      const workerContainer = this.add.container(x, y);

      // 스프라이트 생성 (agentId에 따라 다른 캐릭터 사용)
      const sprite = this.createWorkerSprite(agentId);
      if (sprite) {
        workerContainer.add(sprite);

        // // 캐릭터명 텍스트 추가 (검정색)
        const nameText = this.add
          .text(0, -20, agentId, {
            fontFamily: "Arial",
            fontSize: "14px",
            color: "#000000",
            align: "center",
          })
          .setOrigin(0.5, 1);
        workerContainer.add(nameText);
        this.workerNames.set(agentId, nameText);

        // // 메시지 박스(초기 없음)
        const messageBox = this.createMessageBox("");
        messageBox.setVisible(false);
        messageBox.setY(-68); // name 위에
        workerContainer.add(messageBox);
        this.workerMessages.set(agentId, messageBox);

        // // 워커 저장
        this.workers.set(agentId, workerContainer);

        console.log(`Created new worker: ${agentId} at (${x}, ${y})`);
      }
    } catch (error) {
      console.error("Error creating worker:", error);
    }
  }

  private updateExistingWorker(agentId: string, workerData: WorkerMessage) {
    const workerContainer = this.workers.get(agentId);
    if (!workerContainer) return;

    const { position } = workerData;

    if (position) {
      try {
        // 부드러운 이동을 위한 트윈 애니메이션
        this.tweens.add({
          targets: workerContainer,
          x: position.x,
          y: position.y,
          duration: 500,
          ease: "Power2",
        });

        console.log(
          `Updated worker: ${agentId} to (${position.x}, ${position.y})`
        );
      } catch (error) {
        console.error("Error updating worker position:", error);
      }
    }
  }

  private createWorkerSprite(
    agentId: string
  ): Phaser.GameObjects.Sprite | null {
    try {
      // agentId에 따라 다른 캐릭터 선택
      const characterKey = this.getCharacterKey(agentId);

      // 캐릭터 스프라이트 생성
      const sprite = this.add.sprite(0, 0, characterKey);
      sprite.setScale(1.0); // 크기 조정

      // 기본 애니메이션 재생
      sprite.play(`${characterKey}_idle_down`);

      return sprite;
    } catch (error) {
      console.error("Error creating worker sprite:", error);
      return null;
    }
  }

  private getCharacterKey(agentId: string): string {
    const characterMap = {
      "naver-ai": "adam",
      "tistory-ai": "lucy",
      "google-ai": "ash",
      "openai-ai": "nancy",
    };

    return characterMap[agentId as keyof typeof characterMap] || "adam";
  }

  // 메시지 박스 UI (client 스타일)
  private createMessageBox(text: string): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const maxWidth = 165;
    const padding = 8;
    const fontSize = 13;
    const fontFamily = "Arial";

    const textObj = this.add
      .text(0, 0, text, {
        fontFamily,
        fontSize: `${fontSize}px`,
        color: "#000000",
        align: "center",
        wordWrap: { width: maxWidth, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    // 박스 크기 계산
    const boxWidth = Math.min(maxWidth, textObj.width) + padding * 2;
    const boxHeight = textObj.height + padding * 2;

    const box = this.add.graphics();
    box.fillStyle(0xffffff, 1);
    box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 6);
    box.lineStyle(1, 0x000000, 1);
    box.strokeRoundedRect(
      -boxWidth / 2,
      -boxHeight / 2,
      boxWidth,
      boxHeight,
      6
    );

    container.add([box, textObj]);
    container.setDepth(1000);
    return container;
  }

  // 메시지 업데이트 (client 스타일)
  private updateWorkerMessage(agentId: string, message?: string) {
    const workerContainer = this.workers.get(agentId);
    const messageBox = this.workerMessages.get(agentId);
    if (!workerContainer || !messageBox) return;

    // messageBox가 workerContainer의 자식이 아니면 추가 (중복 방지)
    if (!workerContainer.list.includes(messageBox)) {
      workerContainer.add(messageBox);
    }

    // 기존 메시지 박스 내용만 지우고 새로 그림
    messageBox.removeAll(true);
    if (message && message.trim() !== "") {
      // 메시지 텍스트와 박스 새로 생성
      const maxWidth = 165;
      const padding = 8;
      const fontSize = 13;
      const fontFamily = "Arial";
      const textObj = this.add
        .text(0, 0, message, {
          fontFamily,
          fontSize: `${fontSize}px`,
          color: "#000000",
          align: "center",
          wordWrap: { width: maxWidth, useAdvancedWrap: true },
        })
        .setOrigin(0.5);
      const boxWidth = Math.min(maxWidth, textObj.width) + padding * 2;
      const boxHeight = textObj.height + padding * 2;
      const box = this.add.graphics();
      box.fillStyle(0xffffff, 1);
      box.fillRoundedRect(
        -boxWidth / 2,
        -boxHeight / 2,
        boxWidth,
        boxHeight,
        6
      );
      box.lineStyle(1, 0x000000, 1);
      box.strokeRoundedRect(
        -boxWidth / 2,
        -boxHeight / 2,
        boxWidth,
        boxHeight,
        6
      );
      messageBox.add([box, textObj]);
      messageBox.setY(-53); // name 위에
      messageBox.setVisible(true);
    } else {
      messageBox.setVisible(false);
    }
  }

  // 워커 제거
  removeWorker(agentId: string) {
    const workerContainer = this.workers.get(agentId);
    if (workerContainer) {
      workerContainer.destroy();
      this.workers.delete(agentId);
    }
    const nameText = this.workerNames.get(agentId);
    if (nameText) {
      nameText.destroy();
      this.workerNames.delete(agentId);
    }
    const messageBox = this.workerMessages.get(agentId);
    if (messageBox) {
      messageBox.destroy();
      this.workerMessages.delete(agentId);
    }
    console.log(`Removed worker: ${agentId}`);
  }
}
