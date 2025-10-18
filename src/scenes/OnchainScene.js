import { erc721Abi } from '../abis/erc721';
import { keccak256, toHex } from 'viem';

export class OnchainScene extends Phaser.Scene {
  constructor() {
    super('OnchainScene');
    this.scoreToMint = 0;
    this.account = null;
    this.contract = null;
    this.isInitialized = false;   
  }

  init(data) {
    this.scoreToMint = data?.score || 1;
    this.anomalyLevel = data?.anomalyLevel || 1;
    this.blackSwanLevel = data?.blackSwanLevel || 1;
    this.totalClicks = data?.totalClicks || 1;
    this.setMintParams = window.phaserGame?.web3Data?.setMintParams || null;
  }

  create() {
    this.addEventListeners();
    this.setupUI();
    this.createMintButtons();
  }
  
  addEventListeners() {
    const scene = this;
    this.onMintResult = (e) => {
      const { success, message, hash } = e.detail;
          
      if (success) {
        this.showSuccessAnimation('✨');
        this.statusText.setText(message).setColor('#00ff00');
      } else {
        this.statusText.setText(message).setColor('#ff0000');
      }

      this.time.delayedCall(4444, () => {
        this.statusText.setText('');
      });
    }
    
    this.onJackpotResult = (e) => {
      const { success, message } = e.detail;
          
      if (success) {
        this.showSuccessAnimation('🎉️');
        this.jackpotText.setText(message).setColor('#00ff00');
      } else {
        this.jackpotText.setText(message).setColor('#ff0000');
      }

      this.time.delayedCall(4444, () => {
        this.jackpotText.setText('');
      });
    }
    
    document.addEventListener('mint-result', this.onMintResult);
    document.addEventListener('jackpot-result', this.onJackpotResult);
  }
  
  createMintButtons() {
    // free mint button
    this.mintBtn.setInteractive().setAlpha(1);
    this.mintBtn.on('pointerdown', () => {
      this.setMintParams({ 
        score: this.scoreToMint, 
        anomalyLevel: this.anomalyLevel, 
        blackSwanLevel: this.blackSwanLevel,
        totalClicks: this.totalClicks, 
        hash: this.generateScoreHash(),
        isFree: true
      });
      this.statusText.setText('Minting... Please, confirm in your wallet.').setColor('#00ff00');

      this.time.delayedCall(1111, () => {
        document.getElementById('mint-trigger').click();
      });
    });
    
    // paid mint button
    this.paidMintBtn.setInteractive().setAlpha(1);
    this.paidMintBtn.on('pointerdown', () => {
      this.setMintParams({ 
        score: this.scoreToMint, 
        anomalyLevel: this.anomalyLevel, 
        blackSwanLevel: this.blackSwanLevel,
        totalClicks: this.totalClicks, 
        hash: this.generateScoreHash(),
        isFree: false
      });
      this.statusText.setText('Minting... Please, confirm in your wallet.').setColor('#00ff00');

      this.time.delayedCall(1111, () => {
        document.getElementById('mint-trigger').click();
      });
    });
  }

  setupUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const green = '#0f0';
    const font = 'Share Tech Mono';

    // Background
    this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0.9);

    // Title
    this.add.text(width/2, 80, 'MINT YOUR SCORE', {
      fontFamily: font,
      fontSize: '24px',
      fill: green
    }).setOrigin(0.5);

    // Score display
    this.add.text(width/2, 140, `Score: ${this.scoreToMint}`, {
      fontFamily: font,
      fontSize: '18px',
      fill: green
    }).setOrigin(0.5);

    // Connect button
    this.connectBtn = this.add.text(width/2, 220, 'CONNECT WALLET', {
      fontFamily: font,
      fontSize: '18px',
      fill: '#333',
      backgroundColor: green,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    // Mint button
    this.mintBtn = this.add.text(width/2, 300, 'FREE MINT SCORE', {
      fontFamily: font,
      fontSize: '18px',
      fill: '#333',
      backgroundColor: green,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // Paid Mint button
    this.paidMintBtn = this.add.text(width/2, 380, 'PAID MINT SCORE', {
      fontFamily: font,
      fontSize: '18px',
      fill: '#333',
      backgroundColor: green,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // Status text
    this.statusText = this.add.text(width/2, 420, '', {
      fontFamily: font,
      fontSize: '16px',
      fill: green
    }).setOrigin(0.5);
    
    // Status text
    this.jackpotText = this.add.text(width/2, 460, '', {
      fontFamily: font,
      fontSize: '16px',
      fill: green
    }).setOrigin(0.5);
    
    // Debug text
    const debugString = JSON.stringify({
      //systemInfo: this.sys.game.device.os,
      isAndroid: this.sys.game.device.os.android,
      isIOs: this.sys.game.device.os.iOS,
      isTouchable: this.sys.game.device.input.touch,
      isDesktop: this.sys.game.device.os.desktop
    }, null, 2);
    this.debugText = this.add.text(width/2, 550, debugString, {
      fontFamily: font,
      fontSize: '16px',
      fill: green
    }).setOrigin(0.5);

    // Back button
    this.backBtn = this.add.text(width/2, 460, 'BACK TO GAME', {
      fontFamily: font,
      fontSize: '16px',
      fill: green
    }).setOrigin(0.5).setInteractive();

    // Events
    this.connectBtn.on('pointerdown', () => this.connectWallet());
    this.backBtn.on('pointerdown', () => this.goBack());
  }
  
  async connectWallet() {
    //this.connectFunction();
    document.dispatchEvent(new Event('open-wallet-modal'));
  }
  
  generateScoreHash() {
    const data = `${this.scoreToMint}-${this.anomalyLevel}-${this.blackSwanLevel}-${this.totalClicks}`;//-${Date.now()}`;
    return keccak256(toHex(data));
  }
  
  showSuccessAnimation(particleEmoji) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const particle = this.add.text(x, y, particleEmoji, { fontSize: '20px' }).setAlpha(0);
      
      this.tweens.add({
        targets: particle,
        y: y - 100,
        alpha: { from: 0, to: 1 },
        duration: 1111,
        ease: 'Power1',
        delay: Math.random() * 420,
        onComplete: () => particle.destroy()
      });
    }
  }
  
  goBack() {
    this.scene.stop();
    this.scene.resume('MainScene');
  }
  
  shutdown() {
    document.removeEventListener('mint-result', this.onMintResult);
    document.removeEventListener('jackpot-result', this.onJackpotResult);
  }
}
