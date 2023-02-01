

export class BackGroundScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BackGroundScene',
    });
  }

  public create() {
    this.add.image(0, 0, 'water').setScale(0.2, 0.3).setOrigin(0, 0);
  }
}
