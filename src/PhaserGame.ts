import Phaser from "phaser";
import GameScene from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-container",
  backgroundColor: "#333333",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: 800,
    height: 600,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  autoFocus: true,
  scene: [GameScene],
};

const phaserGame = new Phaser.Game(config);

// 전역에서 접근 가능하도록 설정
declare global {
  interface Window {
    game: Phaser.Game;
  }
}

window.game = phaserGame;

export default phaserGame;
