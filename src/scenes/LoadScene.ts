export class LoadScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoadScene',
    });
  }

  public preload() {
    this.load.image('ship', 'assets/ship.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('water', 'assets/water.jpg');
    this.load.audio('shoot', 'assets/shoot.wav');
    this.load.audio('explode', 'assets/explode.wav');
  }

  public create() {
    this.scene.run('GameScene');
    this.scene.run('BackGroundScene');
    this.scene.sendToBack('BackGroundScene');
    this.scene.run('ScoreScene');
  }
}
