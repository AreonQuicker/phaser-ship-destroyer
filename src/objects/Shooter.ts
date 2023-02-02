import Phaser from 'phaser'

export class Shooter extends Phaser.GameObjects.Image {
  public currentBody!: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)
  }

  public addToScene() {
    this.currentBody = this.body as Phaser.Physics.Arcade.Body
    this.currentBody.setSize(20, 20)
    this.currentBody.setCollideWorldBounds(true)
    this.currentBody.onWorldBounds = true

    this.scene.physics.world.on(
      'worldbounds',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (body: unknown, _1: unknown, _2: unknown, _3: unknown, _4: unknown) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (body.gameObject === this) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const shooter = body.gameObject as Shooter
          shooter.destroy()
        }
      },
      this,
    )
  }

  public destroy(fromScene?: boolean) {
    super.destroy(fromScene)
  }
}
