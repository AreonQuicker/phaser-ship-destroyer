import Phaser from 'phaser';
import { Shooter } from './Shooter';
import { MovementPoint } from '../scenes/GameScene';
import { sceneEvents } from '../events';

export class Ship extends Phaser.GameObjects.Image {
  public isSelected = false;
  public prevIsSelected = false;
  public currentBody!: Phaser.Physics.Arcade.Body;
  public lifePoints = 100;
  private shooterGroup!: Phaser.Physics.Arcade.Group;
  private progressBar!: Phaser.GameObjects.Graphics;
  private otherShips!: Phaser.GameObjects.Group | Ship;
  public score = 0;
  private isPlayer = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    totalShooters = 1,
    isPlayer = false,
  ) {
    super(scene, x, y, texture, frame);
    this.setInteractive();
    this.isPlayer = isPlayer;

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

  preUpdate(_: number, _2: number) {
    if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
      this.rotation =
        Phaser.Math.Angle.Between(
          this.x,
          this.y,
          this.x - this.body.velocity.x,
          this.y - this.body.velocity.y,
        ) -
        Math.PI / 2;
    }
  }

  public update(_: number, _2: number) {
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

    this.scene.physics.add.overlap(
      this.shooterGroup,
      this.otherShips,
      this.handleOverlapWithBullet.bind(this),
      undefined,
      this,
    );
  }

  public shoot(pointer: MovementPoint) {
    if (!pointer?.x || !pointer?.y) return;

    const bullet = this.shooterGroup.create(this.x, this.y, 'bullet');

    if (!bullet) return;
    if (this.isPlayer) this.scene.sound.play('shoot');

    // const handleOverlap = (
    //   _: Phaser.GameObjects.GameObject,
    //   ob2: Phaser.GameObjects.GameObject,
    // ) => {
    //   if (o.active) o.destroy()
    //   this.shooterGroup.remove(bullet, true, true)
    //   const otherShip = ob2 as Ship
    //   if (otherShip.active && this.active) {
    //     otherShip.takeDamamge(10)
    //     this.score += 10
    //     if (this.isPlayer) {
    //       sceneEvents.emit('score', this.score)
    //       this.scene.sound.play('explode')
    //     }
    //   }
    // }

    this.scene.physics.moveToObject(bullet, pointer, 500);
  }

  private handleOverlapWithBullet(
    ob1: Phaser.GameObjects.GameObject,
    ob2: Phaser.GameObjects.GameObject,
  ) {
    // if (o.active) o.destroy();
    let otherShip: Ship;
    let shooter: Shooter;

    if (ob2 instanceof Ship) {
      otherShip = ob2 as Ship;
      shooter = ob1 as Shooter;
    } else {
      otherShip = ob1 as Ship;
      shooter = ob2 as Shooter;
    }

    this.shooterGroup.remove(shooter, true, true);
    if (otherShip.active && this.active) {
      otherShip.takeDamamge(10);
      this.score += 10;
      if (this.isPlayer) {
        sceneEvents.emit('score', this.score);
        this.scene.sound.play('explode');
      }
    }
  }

  takeDamamge(dame: number) {
    if (!this.active) return;
    this.lifePoints -= dame;
    this.updateProgress(this.lifePoints);
    if (this.lifePoints <= 0) {
      this.destroy();
    }
  }

  updateProgress(value: number) {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x8ad173, 1);
    this.progressBar.fillRect(0, 0, value, 10);
    this.progressBar.lineStyle(1, 0xffffff, 1);
    this.progressBar.strokeRect(0, 0, 100, 10);
  }
}
