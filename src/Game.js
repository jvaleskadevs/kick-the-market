import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { TerminalScene } from './scenes/TerminalBoot';
import { OnchainScene } from './scenes/OnchainScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';


class Game {
  constructor(container, web3Data) {
    this.web3Data = web3Data;

    const config = {
      type: Phaser.AUTO,
      parent: container,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      pixelArt: true,
      backgroundColor: '#000000',
      scene: [TerminalScene, BootScene, MainScene, OnchainScene, LeaderboardScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }
        }
      },
      render: {
        antialias: false,
        roundPixels: true
      }
    };

    this.game = new Phaser.Game(config);

    // Make web3Data available to scenes via the game instance
    this.game.web3Data = web3Data;
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}

export default Game;
