import Phaser from 'phaser';
import GameScene from './GameScene';
import Center = Phaser.Scale.Center;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 900,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [GameScene],
  scale: {
    autoCenter: Center.CENTER_BOTH,
  },
};

export default new Phaser.Game(config);
