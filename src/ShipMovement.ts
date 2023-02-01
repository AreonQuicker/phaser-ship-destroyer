import Phaser from 'phaser';
import { MovementPoint } from './GameScene';
import { Ship } from './Ship';

export class ShipMovement {
  private readonly ship!: Ship;
  private scene!: Phaser.Scene;
  private pointer: MovementPoint | null = null;

  constructor(scene: Phaser.Scene, ship: Ship) {
    this.scene = scene;
    this.ship = ship;

    this.ship.on('destroy', () => {
      this.destroy();
    });
  }

  public update(_: number, _2: number) {
    if (!this.ship.active) return;
    if (this.pointer != null) {
      if (
        Phaser.Math.Distance.Between(this.ship.x, this.ship.y, this.pointer.x, this.pointer.y) < 10
      ) {
        this.ship.currentBody.velocity.set(0);
      }
    }
  }

  public handleMove(pointer: MovementPoint) {
    if (!this.ship.active) return;
    this.pointer = pointer;
    const end = new Phaser.Math.Vector2(this.pointer.x, this.pointer.y);
    this.scene.physics.moveToObject(this.ship, end, 100);
  }

  public destroy() {
    this.ship.removeListener('destroy');
    if (!this.ship.active) return;
    this.ship.currentBody.velocity.x = 0;
    this.ship.currentBody.velocity.y = 0;
  }

  public get isActive() {
    return this.ship.active;
  }
}
