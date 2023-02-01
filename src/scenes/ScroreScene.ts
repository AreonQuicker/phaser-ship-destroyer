import Phaser from 'phaser'
import { sceneEvents } from '../events'

export class ScoreScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text

  constructor() {
    super({
      key: 'ScoreScene',
    })
  }

  public create() {
    this.scoreText = this.add.text(10, 10, `Score: ${0}`, { fontSize: '32px', fontStyle: 'bold' })

    sceneEvents.on('score', (score: number) => {
      this.scoreText.setText(`Score: ${score}`)
    })

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off('score')
    })
  }
}
