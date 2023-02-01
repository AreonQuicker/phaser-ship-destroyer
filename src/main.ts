import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import Center = Phaser.Scale.Center;
import { LoadScene } from './scenes/LoadScene';
import { BackGroundScene } from './scenes/BackGroundScene';
import { ScoreScene } from './scenes/ScroreScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 900,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [LoadScene, GameScene, BackGroundScene, ScoreScene],
  scale: {
    autoCenter: Center.CENTER_BOTH,
  },
};

export default new Phaser.Game(config);
