import Phaser from 'phaser';
import { Ship } from './Ship';

export class AIShipMovement {
  private ship!: Ship;
  private scene!: Phaser.Scene;
  private readonly playerShip!: Ship;
  private movementEvent!: Phaser.Time.TimerEvent;
  private shoopEvent!: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, ship: Ship, playerShip: Ship) {
    this.scene = scene;
    this.ship = ship;
    this.playerShip = playerShip;

    this.ship.on('destroy', () => {
      this.destroy();
    });

    this.movementEvent = this.scene.time.addEvent({
      delay: 2000, // delay in milliseconds
      callback: () => {
        if (!this.ship.active) return;
        const randomX = Math.random() * 200 - 100;
        const randomY = Math.random() * 200 - 100;
        this.ship.currentBody.velocity.x = randomX;
        this.ship.currentBody.velocity.y = randomY;
      },
      loop: true,
    });

    this.shoopEvent = this.scene.time.addEvent({
      delay: 1000, // delay in milliseconds
      callback: () => {
        const a = Phaser.Math.Between(1, 2);
        if (a === 1 && this.ship.active && this.playerShip.active) {
          this.ship.shoot(this.playerShip);
        }
      },
      loop: true,
    });

    // const tween = this.scene.tweens.add({
    //   targets: this.ship,
    //   x: 100,
    //   y: 400,
    //   duration: 1000,
    //   ease: 'Linear',
    //   repeat: 0,
    //   yoyo: true,
    // });
  }

  destroy() {
    this.movementEvent.destroy();
    this.shoopEvent.destroy();
    this.ship.removeListener('destroy');
    if (this.ship.active) {
      this.ship.currentBody.velocity.x = 0;
      this.ship.currentBody.velocity.y = 0;
    }
  }

  public get isActive() {
    return this.ship.active;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public update(_: number, _2: number) {}
}
