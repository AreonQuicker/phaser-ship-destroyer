import Phaser from 'phaser';

export class Shooter extends Phaser.GameObjects.Image {
  public currentBody!: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
  }

  public addToScene() {
    this.currentBody = this.body as Phaser.Physics.Arcade.Body;
    this.currentBody.setSize(20, 20);
    this.currentBody.setCollideWorldBounds(true);
    this.currentBody.onWorldBounds = true;

    this.scene.physics.world.on(
      'worldbounds',
      (body, up, down, left, right) => {
        if (body.gameObject === this) {
          const shooter = body.gameObject as Shooter;
          shooter.destroy();
        }
      },
      this,
    );
  }

  public destroy(fromScene?: boolean) {
    super.destroy(fromScene);
  }
}
