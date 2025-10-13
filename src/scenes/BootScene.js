export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load placeholder assets
        
    // images & sprites
    
    //this.load.image('bg', '/assets/trump_04.png');
    
    this.load.image('kickBtn', '/assets/button.png');

    this.load.spritesheet('player', '/assets/trump_spritesheet_128.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet('scanlines', '/assets/scanlines_spritesheet.png', {
      frameWidth: 512,
      frameHeight: 512
    });

    this.load.image('packet', '/assets/red_block_128.png');
    
    this.load.spritesheet('packetAnim', '/assets/red_block_spritesheet.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    
    // audio & sounds
    
    //this.load.audio('type', '/assets/sounds/type.mp3');      // keyboard typing
    //this.load.audio('beep', '/assets/sounds/beep.wav');      // terminal beep
    //this.load.audio('glitch', '/assets/sounds/glitch.wav');  // screen glitch
    //this.load.audio('access', '/assets/sounds/access.mp3');  // "access granted"
  }

  create() {
    // display loading text
    this.add.text(
      window.innerWidth / 2, 300, 
      'Loading...', 
      { fontSize: '32px', fill: '#0f0' }
    ).setOrigin(0.5);
    // move to next scene
    this.time.delayedCall(420, () => {
      this.scene.start('MainScene');
    });
  }
}
