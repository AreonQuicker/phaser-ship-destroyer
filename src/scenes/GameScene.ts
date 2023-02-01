import Phaser from 'phaser';
import { ShipMovement } from '../handle-movement/ShipMovement';
import { Ship } from '../objects/Ship';
import { AIShipMovement } from '../handle-movement/AIShipMovement';

export type MovementPoint = { x: number; y: number };
export type ComputerShipMovement = { computerShip: Ship; aiShipMovement: AIShipMovement };

enum GameStatus {
  PRE_START = 'PRE_START',
  START = 'START',
  GAME_OVER = 'GAME_OVER',
}

export default class GameScene extends Phaser.Scene {
  private gameStatus = GameStatus.PRE_START;
  private computerShipMovements: ComputerShipMovement[] = [];
  private computerShips!: Phaser.GameObjects.Group;
  private ship!: Ship;
  private shipMovement!: ShipMovement;
  private currentMovementPoint!: MovementPoint;
  private spawnEvent!: Phaser.Time.TimerEvent;
  private totalComputers = 5;

  constructor() {
    super('GameScene');
  }

  create() {
    this.ship = new Ship(
      this,
      this.scale.width * 0.5,
      this.scale.height - 50,
      'ship',
      undefined,
      4,
      true,
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

    this.setupEvents();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.spawnEvent.destroy();
      this.input.removeListener('pointerdown');
      this.input.removeListener('pointermove');
      this.input.keyboard.removeListener('keydown-SPACE');
      this.shipMovement.destroy();
      this.computerShipMovements.forEach((csm) => {
        csm.aiShipMovement.destroy();
        csm.computerShip.destroy();
      });
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });
  }

  startGame() {
    this.spawnEvent = this.time.addEvent({
      delay: 4000, // delay in milliseconds
      callback: () => {
        if (this.computerShips.getChildren().length < this.totalComputers) {
          this.spawnComputer();
        }
      },
      loop: true,
    });
    this.spawnComputer();
    this.gameStatus = GameStatus.START;
  }

  private setupEvents() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameStatus == GameStatus.GAME_OVER || this.gameStatus == GameStatus.PRE_START)
        return;
      const p = { x: pointer.x, y: pointer.y };
      this.shipMovement.handleMove(p);
    });

    this.input.on(
      'pointermove',
      (pointer: Phaser.Input.Pointer) => {
        if (this.gameStatus == GameStatus.GAME_OVER || this.gameStatus == GameStatus.PRE_START)
          return;
        this.currentMovementPoint = { x: pointer.x, y: pointer.y };
      },
      this,
    );

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameStatus == GameStatus.GAME_OVER || this.gameStatus == GameStatus.PRE_START)
        return;
      this.ship.shoot(this.currentMovementPoint);
    });
  }

  spawnComputer() {
    const computerShip = this.computerShips.create(this.scale.width * 0.5, 50, 'ship');
    const aiShipMovement = new AIShipMovement(this, computerShip, this.ship);
    computerShip.setOtherShips(this.ship);

    this.computerShipMovements.push({ computerShip, aiShipMovement });
  }

  update(time: number, delta: number) {
    if (this.gameStatus == GameStatus.GAME_OVER || this.gameStatus == GameStatus.PRE_START) return;

    if (this.ship.isDead) {
      this.gameOver();
      return;
    }

    if (this.ship.active) this.ship.update(time, delta);
    if (this.shipMovement.isActive) this.shipMovement.update(time, delta);

    this.computerShipMovements.forEach((csm) => {
      if (csm.computerShip.active) csm.computerShip.update(time, delta);
      if (csm.aiShipMovement.isActive) csm.aiShipMovement.update(time, delta);
    });

    super.update(time, delta);
  }

  gameOver() {
    this.gameStatus = GameStatus.GAME_OVER;
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
  }
}
