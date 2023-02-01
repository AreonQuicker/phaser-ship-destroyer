import Phaser from 'phaser';
import { Shooter } from './Shooter';
import { MovementPoint } from './GameScene';

export class Ship extends Phaser.GameObjects.Image {
  public isSelected = false;
  public prevIsSelected = false;
  public currentBody!: Phaser.Physics.Arcade.Body;
  public lifePoints = 100;
  private shooterGroup!: Phaser.Physics.Arcade.Group;
  private progressBar!: Phaser.GameObjects.Graphics;
  private otherShips!: Phaser.GameObjects.Group | Ship;
  public isDead = false;
  public score = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    totalShooters = 1,
  ) {
    super(scene, x, y, texture, frame);
    this.setInteractive();

    this.shooterGroup = this.scene.physics.add.group({
      classType: Shooter,
      createCallback: (go: Phaser.GameObjects.GameObject) => {
        const shooter = go as Shooter;
        shooter.addToScene();
      },
      maxSize: totalShooters,
    });
  }

  get progressX(): number {
    return this.x - 50 * 0.5 - 50 * 0.5;
  }

  get progressY(): number {
    return this.y + 50 * 0.5;
  }

  public addToScene() {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.currentBody = this.body as Phaser.Physics.Arcade.Body;
    this.currentBody.setSize(50, 50);
    this.currentBody.setCollideWorldBounds(true);
    this.on('pointerdown', () => {
      this.prevIsSelected = this.isSelected;
      this.isSelected = true;
    });
    this.on('pointerup', () => {
      this.prevIsSelected = this.isSelected;
      this.isSelected = false;
    });

    this.progressBar = this.scene.add.graphics({
      x: this.progressX,
      y: this.progressY,
    });
    this.updateProgress(this.lifePoints);
  }

  public update(time: number, delta: number) {
    this.progressBar.x = this.progressX;
    this.progressBar.y = this.progressY;
  }

  public destroy(fromScene?: boolean) {
    this.progressBar.destroy();
    this.removeListener('pointerdown');
    this.removeListener('pointerup');
    super.destroy(fromScene);
  }

  public setOtherShips(otherShips: Phaser.GameObjects.Group | Ship) {
    this.otherShips = otherShips;
  }

  public shoot(pointer: MovementPoint) {
    const bullet = this.shooterGroup.create(this.x, this.y, 'bullet');

    if (!bullet) return;

    const o = this.scene.physics.add.overlap(
      bullet,
      this.otherShips,
      handleOverlap.bind(this),
      undefined,
      this,
    );

    function handleOverlap(ob1: Phaser.GameObjects.GameObject, ob2: Phaser.GameObjects.GameObject) {
      const otherShip = ob2 as Ship;
      this.shooterGroup.remove(bullet, true, true);
      if (o.active) o.destroy();
      otherShip.takeDamamge(10);
      this.score += 10;
    }

    this.scene.physics.moveToObject(bullet, pointer, 500);
  }

  public takeDamamge(dame: number) {
    if (this.isDead) return;
    this.lifePoints -= dame;
    this.updateProgress(this.lifePoints);
    if (this.lifePoints <= 0) {
      this.isDead = true;
      this.destroy();
    }
  }

  private updateProgress(value: number) {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x8ad173, 1);
    this.progressBar.fillRect(0, 0, value, 10);
    this.progressBar.lineStyle(1, 0xFFFFFF, 1);
    this.progressBar.strokeRect(0, 0, 100, 10);
  }
}
