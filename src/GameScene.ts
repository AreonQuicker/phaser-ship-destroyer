import Phaser from 'phaser';
import { ShipMovement } from './ShipMovement';
import { Ship } from './Ship';
import { AIShipMovement } from './AIShipMovement';

export type MovementPoint = { x: number; y: number };
export type ComputerShipMovement = { computerShip: Ship; aiShipMovement: AIShipMovement };

export default class GameScene extends Phaser.Scene {
  private isGameOver = false;
  private computerShipMovements: ComputerShipMovement[] = [];
  private computerShips!: Phaser.GameObjects.Group;
  private ship!: Ship;
  private shipMovement!: ShipMovement;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private currentMovementPoint!: MovementPoint;
  private spawnEvent!: Phaser.Time.TimerEvent;
  private totalComputers = 3;

  constructor() {
    super('game');
  }

  preload() {
    this.load.image('ship', 'assets/ship.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('water', 'assets/water.jpg');
  }

  create() {
    this.add.image(0, 0, 'water').setScale(0.2, 0.3).setOrigin(0, 0);

    this.ship = new Ship(
      this,
      this.scale.width * 0.5,
      this.scale.height - 50,
      'ship',
      undefined,
      3,
    );
    this.ship.addToScene();
    this.shipMovement = new ShipMovement(this, this.ship);
    this.computerShips = this.physics.add.group({
      classType: Ship,
      createCallback: (go: Phaser.GameObjects.GameObject) => {
        const ship = go as Ship;
        ship.addToScene();
      },
    });
    this.ship.setOtherShips(this.computerShips);

    this.spawnComputer();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.setupEvents();
  }

  private setupEvents() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const p = { x: pointer.x, y: pointer.y };
      this.shipMovement.handleMove(p);
    });

    this.input.on(
      'pointermove',
      (pointer: Phaser.Input.Pointer) => {
        this.currentMovementPoint = { x: pointer.x, y: pointer.y };
      },
      this,
    );

    this.input.keyboard.on('keydown-SPACE', () => {
      this.ship.shoot(this.currentMovementPoint);
    });

    this.spawnEvent = this.time.addEvent({
      delay: 8000, // delay in milliseconds
      callback: () => {
        if (this.computerShips.getChildren().length < 3) {
          this.spawnComputer();
        }
      },
      loop: true,
    });
  }

  spawnComputer() {
    const computerShip = this.computerShips.create(this.scale.width * 0.5, 50, 'ship');
    const aiShipMovement = new AIShipMovement(this, computerShip, this.ship);
    computerShip.setOtherShips(this.ship);

    this.computerShipMovements.push({ computerShip, aiShipMovement });
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    if (this.ship.isDead) {
      this.isGameOver = true;
      this.gameOver();
      return;
    }

    if (this.shipMovement.isActive) this.shipMovement.update(time, delta);
    if (this.ship.active) this.ship.update(time, delta);

    this.computerShipMovements.forEach((csm) => {
      if (csm.computerShip.active) csm.computerShip.update(time, delta);
      if (csm.aiShipMovement.isActive) csm.aiShipMovement.update(time, delta);
    });

    super.update(time, delta);
  }

  gameOver() {
    this.spawnEvent.destroy();
    this.input.removeListener('pointerdown');
    this.input.removeListener('pointermove');
    this.input.keyboard.removeListener('keydown-SPACE');
    this.shipMovement.destroy();
    this.computerShipMovements.forEach((csm) => csm.aiShipMovement.destroy());

    this.add
      .text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over', {
        fontSize: '64px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(
        this.scale.width * 0.5,
        this.scale.height * 0.5 + 50,
        'Toal score of ' + this.ship.score,
        {
          fontSize: '60px',
          fontStyle: 'bold',
        },
      )
      .setOrigin(0.5, 0.5);
  }
}
