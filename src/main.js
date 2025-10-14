import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { TerminalScene } from './scenes/TerminalBoot';
import { OnchainScene } from './scenes/OnchainScene';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  backgroundColor: '#000000',
  scene: [TerminalScene, BootScene, MainScene, OnchainScene],
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

new Phaser.Game(config);
