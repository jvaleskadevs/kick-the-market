const FLASH_DURATION = 111;
const MEDIUM_FLASH_DURATION = 555;
const LONG_FLASH_DURATION = 1111;
const GLITCH_INTERVAL = 7777;
const SUCCESS_THRESHOLD = 0.69;

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.kickPower = 1;  
    this.totalClicks = 0;
    this.levelText = null;
    this.anomalyLevel = 1;
    this.anomalyTrigger = 50;
    this.inAnomalyMode = false;
    this.packets = [];
    this.packetsCollected = 0;
    this.maxPackets = 7;
    this.packetSpeed = 300;
    this.anomalyDuration = 11111;    
    this.anomalyOverlay = null;
    this.blackSwanLevel = 1;
    this.blackSwanTrigger = 33;
    this.isBlackSwanMode = false;
    this.candlesConverted = 0;
    this.maxCandles = 7;
    this.candleSpeed = 1111;
    this.blackSwanDuration = 11111;
    
    this.isMobile = false;
    
    this.settingsOpen = false;
    this.settingsMenu = null;
    this.audioEnabled = true;
    this.flashesEnabled = true;
    this.skinModEnabled = false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#000');

    if (this.sys.game.device.input.touch) {     
      if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
        this.isMobile = true;
      } 
    }    

    const width = window.innerWidth;
    const height = window.innerHeight;

    // text 
    const font = 'Share Tech Mono';
    const greenColor = '#0f0';
    const textStyle = {
      fontFamily: font,
      fontSize: '24px',
      fill: greenColor,
      stroke: '#090',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#00ff00',
        blur: 4,
        fill: true
      },
      backgroundColor: '#000'
    };

    this.instructionsMsg = this.add.text(width / 2, height - 111, 'Click to Kick!', textStyle).setOrigin(0.5);
    this.add.text(width / 2, 400, 'KICK!', textStyle).setOrigin(0.5);

    this.scoreDisplay = this.add.text(400, 500, 'SCORE: XXX', {
      fontFamily: font,
      fontSize: '42px',
      fill: greenColor,
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setShadow(2, 2, '#00ff00', 5);
    
    this.score = 0;
    this.targetScore = 0;

    this.levelText = this.add.text(
      20, 20, 
      `ANOMALY LVL: ${this.anomalyLevel}\nBLACKSWAN LVL: ${this.blackSwanLevel}`, 
    {
      fontFamily: font,
      fontSize: '18px',
      fill: greenColor,
      stroke: '#090',
      strokeThickness: 2
    }).setDepth(100);

    this.log = this.add.text(20, 70, '', {
      fontFamily: font,
      fontSize: this.isMobile ? '16px' : '21px',
      fill: greenColor
    });

    this.addLog = (text) => {
      const line = `[${Date.now() % 100000}] ${text}`;
      //this.log.setText(this.log.text.split('\n').slice(-33).concat(line).join('\n'));
      this.log.setText([line].concat(this.log.text.split('\n').slice(-27)).join('\n'));
    };

    this.anomalyWarning = this.add.text(width / 2, 111, '', {
      fontFamily: font,
      fill: '#f00',
      fontSize: '42px',
      backgroundColor: '#000',
    }).setOrigin(0.5).setAlpha(0);

    this.anomalyOverlay = this.add.text(width / 2, height / 2, '', {
      fontFamily: font,
      fontSize: this.isMobile ? '32px' : '48px',
      fill: '#f00',
      //stroke: '#600',
      //strokeThickness: 4,
      align: 'center',
      padding: { x: 4, y: 4 },
      backgroundColor: '000'
    })
    .setOrigin(0.5)
    .setAlpha(0)
    .setDepth(1000);

    // objects

    this.player = this.add.sprite(
      width / 2, 
      height / 2, 
      'player'
    ).setScale(3).setVisible(this.skinModEnabled);
    
    this.ball = this.add.sprite(
      width / 2, 
      height / 2, 
      'ball'
    ).setScale(3).setOrigin(0.5);

    this.kickBtn = this.add.image(
      width / 2, 
      height / 2, 
      'kickBtn'
    ).setScale(5).setOrigin(0.5).setInteractive();

    // anims

    this.anims.create({
      key: 'kickAnim',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: 0
    });

    this.anims.create({
      key: 'pulse',
      frames: this.anims.generateFrameNumbers('packetAnim', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });

    this.scanlines = this.add.image(width / 2, height / 2, 'scanlines')
      .setAlpha(0.1)
      .setBlendMode(Phaser.BlendModes.OVERLAY)
      .setScale(3);
    
    // buttons

    this.kickBtn.on('pointerdown', () => this.kick());

    this.input.keyboard.once('keydown-U', () => {
      this.kickPower += 1;
      this.add.text(400, 350, `+1 Kick Power!`, { fontSize: '20px', fill: '#f1c40f' }).setOrigin(0.5).setAlpha(0.8);
    });
    
    // TODO: add gear icon sprite
    // fallback simple gear shape:
    const gear = this.make.graphics();
    gear.lineStyle(2, 0x00ff00);
    gear.strokeCircle(0, 0, 20);
    // Add some teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = Math.cos(angle) * 20;
      const y1 = Math.sin(angle) * 20;
      const x2 = Math.cos(angle) * 28;
      const y2 = Math.sin(angle) * 28;
      gear.lineBetween(x1, y1, x2, y2);
    }
    gear.generateTexture('gearIcon', 40, 40);
    gear.destroy();

    // settings
    this.createSettings();

    // events 
    
    this.events.on('update', () => {      
      const remainingA = this.anomalyTrigger - this.totalClicks;
      const remainingB = this.blackSwanTrigger - this.totalClicks;
      if (remainingA > 0 && remainingA <= 10 && !this.inAnomalyMode) {
        // check for anomaly
        this.anomalyWarning.setAlpha(1);
        this.anomalyWarning.setText(`ANOMALY ETA: ${remainingA}`);
      } else if (remainingB > 0 && remainingB <= 10 && !this.isBlackSwanMode) {
        // check for blackswan
        this.anomalyWarning.setAlpha(1);
        this.anomalyWarning.setText(`BLACKSWAN ETA: ${remainingB}`);
      } else {
        this.anomalyWarning.setAlpha(0);
      }
    });

    window.addEventListener('resize', () => {
      this.resizeGame();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resizeGame(), 100);
    });
    
    this.time.addEvent({
      delay: GLITCH_INTERVAL + Math.random() * GLITCH_INTERVAL,
      callback: () => {
        if (this.score > 0) {
          const temp = this.scoreDisplay.text;
          const tempScore = this.score;
          this.scoreDisplay.setText('CORRUPTED DATA');                
            //this.sound.play('glitch');
          this.time.delayedCall(2222 + Math.random() * 5555, () => {
            this.scoreDisplay.setText(temp);
            this.score = tempScore;
          });
        }
      },
      loop: true
    });
    
    this.time.addEvent({
      delay: GLITCH_INTERVAL + Math.random() * GLITCH_INTERVAL,
      callback: () => {
        this.cameras.main.shake(FLASH_DURATION, 0.01);
        if (this.flashesEnabled) {
          this.cameras.main.flash(FLASH_DURATION, 255, 0, 0);
        }
        this.addLog('GLITCH: PACKET LOSS -1');
        this.score -= 1;
        //this.sound.play('glitch');
      },
      loop: true
    });
    
    // audio
    
    //this.beepSFX = this.sound.add('beep');
    //this.glitchSFX = this.sound.add('glitch');
    //this.accessSFX = this.sound.add('access');

    // start scene

    this.resizeGame();
    this.createCandles();
    this.loadSave();
  }

  updateAnomalyUI() {
    if (this.inAnomalyMode) {
      const percent =  Math.floor((this.packetsCollected / this.maxPackets) * 100);    
      console.log(percent);
      this.anomalyOverlay.setText(`${percent}%\nCAPTURED`);
    } else if (this.isBlackSwanMode) {
      const percent = Math.floor((this.candlesConverted / this.maxCandles) * 100);
      console.log(percent);
      this.anomalyOverlay.setText(`${percent}%\nRECOVERED`);
      this.anomalyOverlay.setAlpha(1);
    }    
  }

  kick() {
    if (this.inAnomalyMode || this.isBlackSwanMode) return;

    if (Math.random() * 1000 > 900) {
      this.addLog('MEMPOOL GLITCH: PACKET LOSS -1');
      this.score -= 1;
      this.cameras.main.shake(FLASH_DURATION, 0.01);
      if (this.flashesEnabled) {
        this.cameras.main.flash(FLASH_DURATION, 255, 0, 0);
      }
      if (this.audioEnabled) {
        //this.sound.play('glitch');
      }
      return;
    }

    this.score += this.kickPower;
    this.totalClicks++;
    
    this.scoreDisplay.setText(`Score: ${this.score}`);
    this.addLog('KICK EXECUTED: +1');

    // Show player, play animation
    this.player.setVisible(this.skinModEnabled);
    this.player.play('kickAnim');

    // Hide after animation
    /*
    this.time.delayedCall(500, () => {
      this.player.setVisible(false);
    });
    */

    this.cameras.main.shake(200, 0.01);
    if (this.flashesEnabled) {
      this.cameras.main.flash(50, 0, 255, 0);
    }    
    if (this.audioEnabled) {
      //this.beepSFX.play();
    }

    // Ball kick effect (just a visual green block moving around)
    this.tweens.add({
      targets: this.ball,
      x: 400 + Phaser.Math.Between(-150, 150),
      y: 200 + Phaser.Math.Between(-80, 0),
      duration: 300,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });
    
    if (this.score > 0) {      
      if (this.score % 21 === 0) {        
        this.addLog('SECURITY ALERT: ANOMALY DETECTED -3');
        this.addLog('SECURITY ALERT: ANOMALY DETECTED -3');
        
        this.score -= 3;
        this.score -= 3;
        
        this.cameras.main.shake(200, 0.02);
        if (this.audioEnabled) {
          //this.glitchSFX.play();
        }
        if (this.flashesEnabled) {
          this.cameras.main.flash(FLASH_DURATION, 255, 0, 0);
        }    
      }

      if (this.score % 11 === 0) {    
        this.addLog('STATUS PENDING: LOADING CHARTS');
        this.addLog('STATUS PENDING: RENDERING CHARTS');     
        this.addLog('STATUS SUCCESS: CHARTS ARE READY'); 
        if (this.audioEnabled) {
          //this.accessSFX.play();
        } 
      } 
    }
    
    // Check for anomaly
    if (!this.inAnomalyMode && !this.isBlackSwanMode && this.totalClicks >= this.anomalyTrigger) {
      this.addLog('SECURITY ALERT: ANOMALY EVENT');
      this.addLog('SECURITY ALERT: ANOMALY EVENT');
      this.cameras.main.shake(200, 0.02);
      if (this.flashesEnabled) {
        this.cameras.main.flash(FLASH_DURATION, 0, 255, 0);
      }
      this.startAnomalyMode();
    }

    // Check for blackswan
    if (!this.inAnomalyMode && !this.isBlackSwanMode && this.totalClicks >= this.blackSwanTrigger) {    
      this.addLog('SECURITY ALERT: BLACKSWAN EVENT');
      this.addLog('SECURITY ALERT: BLACKSWAN EVENT');
      this.cameras.main.shake(200, 0.02);
      if (this.flashesEnabled) {
        this.cameras.main.flash(FLASH_DURATION, 0, 255, 0);
      }
      this.startBlackSwanMode();
    }
  }

  grantPower() {
    // Random power from pool
    const powers = [
      () => {
        this.kickPower += 3;
        this.addLog('POWER: KICK STRENGTH +3');
      },
      () => {
        this.autoClickerActive = true;
        this.time.addEvent({
          delay: 1000,
          callback: this.kick,
          callbackScope: this,
          repeat: 9 // 10 seconds
        });
        this.addLog('POWER: AUTO-KICK x10');
      },
      () => {
        this.score += 100 * this.anomalyLevel;
        this.addLog('POWER: DATA DUMP +100');
      },
      () => {
        this.cameras.main.shake(300, 0.02);
        this.addLog('POWER UPGRADE');
      }
    ];

    const randomPower = Phaser.Utils.Array.GetRandom(powers);
    randomPower();
  }

  endAnomalyMode(forced = false) {
    if (!this.inAnomalyMode) return;

    this.inAnomalyMode = false;

    // Stop spawning
    if (this.packetSpawnEvent) this.packetSpawnEvent.remove();
    if (this.anomalyTimer) this.anomalyTimer.remove();

    // Destroy remaining packets
    this.packets.forEach(p => p.destroy());
    this.packets = [];

    // Calculate success: 69% or more
    const collectedRatio = this.packetsCollected / this.maxPackets;
    const success = collectedRatio >= SUCCESS_THRESHOLD;

    this.log.setText('');
    this.instructionsMsg.setText('Click to kick!');
    if (success) {
      //this.sound.play('access');
      if (this.flashesEnabled) {
        this.cameras.main.flash(1111, 0, 255, 0);
      }
      this.addLog(`ANOMALY CLEAR: BONUS UNLOCKED`);
      this.grantPower(); // define below
      this.anomalyLevel++; // level up
      this.anomalyTrigger += 30 + (this.anomalyLevel * 11);
      this.levelText.setText(`ANOMALY LVL: ${this.anomalyLevel}\nBLACKSWAN LVL: ${this.blackSwanLevel}`);
      
      this.anomalyOverlay.setFill('#0f0');
      this.anomalyOverlay.setText('69%+\nACCESS GRANTED');
      this.time.delayedCall(2222, () => {
        this.anomalyOverlay.setAlpha(0);
        this.anomalyOverlay.setText('');
      }, [], this);
    } else {
      //this.sound.play('glitch');
      if (this.flashesEnabled) {
        this.cameras.main.flash(1111, 255, 0, 0);
      }
      this.addLog(`ANOMALY FAILED: DATA LOST`);
      this.anomalyTrigger += 33;
            
      this.anomalyOverlay.setFill('#f30');
      this.anomalyOverlay.setText('FAILED\nDATA LOST');
      this.time.delayedCall(2222, () => {
        this.anomalyOverlay.setAlpha(0);
        this.anomalyOverlay.setText('');
      }, [], this);
    }
    // Set next trigger (progressive)

    this.saveGame();    
    
    // Spawn some packets animation (non-interactive, just visual)
    for (let i = 0; i < 11; i++) {
      this.time.delayedCall(i * 200, () => {
        const p = this.add.sprite(window.innerWidth / 2, 300, 'packet').setScale(0.69);
        this.tweens.add({ targets: p, y: '-=100', alpha: 0, duration: 800 });
        //this.sound.play('beep');
      });
    }
  }

  update() {
    /*
    if (this.game.loop.frame % 300 === 0) {
      this.saveGame();
    }
    */
  }

  saveGame() {
    localStorage.setItem('kickingClickerSave', JSON.stringify({
      score: this.score,
      kickPower: this.kickPower
    }));
  }

  loadSave() {
    const save = localStorage.getItem('kickingClickerSave');
    if (save) {
      const data = JSON.parse(save);
      this.score = data.score || 0;
      this.kickPower = data.kickPower || 1;
      this.scoreDisplay.setText(`Score: ${this.score}`);
    }
  }

  startAnomalyMode() {
    this.inAnomalyMode = true;
    this.packetsCollected = 0;
    this.packets = [];

    // Increase difficulty
    this.maxPackets = this.maxPackets + Math.floor(this.anomalyLevel * 1.5);
    this.packetSpeed = 200 + (this.anomalyLevel * 50);
    this.anomalyDuration += (this.anomalyLevel * 1111);//Math.max(5000, 10000 - (this.anomalyLevel * 1000));

    // Update UI
    this.addLog('ANOMALY DETECTED: PACKET LEAK');
    this.instructionsMsg.setText('Click to capture!');
    this.log.setText('');
    this.anomalyOverlay.setAlpha(1);
    this.anomalyOverlay.setFill('#f00');

    if (this.flashesEnabled) {
      this.cameras.main.flash(MEDIUM_FLASH_DURATION, 255, 0, 0);
    }
    if (this.audioEnabled) {
      //this.sound.play('glitch');
    }
    this.cameras.main.shake(MEDIUM_FLASH_DURATION, 0.03);

    // Spawn first packet immediately
    this.spawnPacket();

    // Keep spawning
    this.packetSpawnEvent = this.time.addEvent({
    /// TODO:  we are already increasing speed, this may explain why they are sooo fast xd
      delay: 800 - (this.anomalyLevel * 50), // faster spawns   
      callback: this.spawnPacket,
      callbackScope: this,
      loop: true
    });

    // End mode after duration
    this.anomalyTimer = this.time.delayedCall(this.anomalyDuration, () => {
      this.endAnomalyMode(false);
    }, [], this);
  }
  
  spawnPacket() {
    if (!this.inAnomalyMode || this.packets.length >= this.maxPackets) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const y = 100 + Math.random() * (height - 200);
    const x = Math.random() < 0.5 ? -64 : width + 64; // left or right
    const dir = x < 0 ? 1 : -1; // move right or left
      
    const packet = this.add.sprite(x, y, 'packetAnim')
      .setInteractive()
      .setScale(1)
      .setTint(0xff3333);

    // Play animation
    packet.play('pulse');

    // Click to collect
    packet.on('pointerdown', () => {
      if (!packet.active) return;
      this.addLog('PACKET INTERCEPTED');
      this.packetsCollected++;

      if (this.audioEnabled) {
        //this.sound.play('beep');
      }      

      this.updateAnomalyUI();

      packet.setTexture('packet');
      packet.setTint(0x00ff00);
      packet.active = false;

      this.tweens.add({
        targets: packet,
        scale: 0.5,
        alpha: 0,
        duration: 300,
        ease: 'Power1'
      }); 
      // remove from packet list
      this.packets = this.packets.filter(p => p !== packet);

      // Visual feedback
      this.tweens.add({ targets: packet, alpha: 0, duration: 420 });
      
      this.time.delayedCall(420, () => {
        packet.destroy();
      }, [], this); 
    });

    // Add to packet list
    this.packets.push(packet);

    // Add tween to move across screen
    const distance = width + 128;
    const duration = distance / this.packetSpeed * 1000;

    this.tweens.add({
      targets: packet,
      x: x < 0 ? width + 64 : -64,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        if (packet && packet.scene) {
          packet.destroy();
          this.packets = this.packets.filter(p => p !== packet);
        }
      }
    });
  }
  
  
  startBlackSwanMode() {
    this.isBlackSwanMode = true;

    this.candlesConverted = 0;

    // Increase difficulty
    this.maxCandles += Math.floor(this.blackSwanLevel * 1.5);
    this.candleSpeed += (this.blackSwanLevel * 50);
    this.blackSwanDuration += (this.blackSwanLevel * 1111);//Math.max(5000, 10000 - (this.blackSwanLevel * 1000));

    // Visual/Sound Warning
    if (this.flashesEnabled) {
      this.cameras.main.flash(500, 255, 0, 0);
    }
    this.cameras.main.shake(500, 0.03);
    //this.sound.play('glitch');
    this.log.setText('');
    this.instructionsMsg.setText('Click to recover!');
    this.addLog('BLACKSWAN DETECTED');
    this.anomalyOverlay.setFill('#f00');

    // Start spawning
    this.startCandleSpawner();   

    // End mode after duration
    this.blackSwanTimer = this.time.delayedCall(this.blackSwanDuration, () => {
      this.endBlackSwanMode(false);
    }, [], this);    
  }
  
  endBlackSwanMode(forced = false) {
    if (!this.isBlackSwanMode) return;

    this.isBlackSwanMode = false;

    // Stop spawning
    if (this.candleSpawnEvent) this.candleSpawnEvent.remove();
    if (this.blackSwanTimer) this.blackSwanTimer.remove();

    // Destroy remaining candles
    this.candleGroup.clear(true, true);
    this.log.setText('');
    this.instructionsMsg.setText('Click to kick!');

    // Calculate success: 69% or more
    const convertedRatio = this.candlesConverted / this.maxCandles;
    const success = convertedRatio >= SUCCESS_THRESHOLD;

    if (success) {
      //this.sound.play('access');
      if (this.flashesEnabled) {
        this.cameras.main.flash(2222, 0, 255, 0);
      }
      this.addLog(`BLACKSWAN CLEAR`);
      this.addLog(`WE ARE SO BACK`);
      this.addLog(`BLACKSWAN CLEAR`);
      this.addLog(`WE ARE SO BACK`);
      //this.addLog(`BLACKSWAN CLEAR: BONUS UNLOCKED`);
      //this.addLog(`WE ARE SO BACK`);
      this.grantPower(); // define below
      this.blackSwanLevel++; // level up
      this.levelText.setText(`ANOMALY LVL: ${this.anomalyLevel}\nBLACKSWAN LVL: ${this.blackSwanLevel}`);

      this.blackSwanTrigger += Math.floor(this.blackSwanTrigger * 1.1);
      
      this.anomalyOverlay.setFill('#0f0');
      this.anomalyOverlay.setText('69%+\nMARKET RECOVERED');
      this.anomalyOverlay.setAlpha(1);
      this.time.delayedCall(2222, () => {
        this.anomalyOverlay.setAlpha(0);
        this.anomalyOverlay.setText('');
      }, [], this);
    } else {
      //this.sound.play('glitch');
      if (this.flashesEnabled) {
        this.cameras.main.flash(2222, 0, 255, 0);
      }
      this.addLog(`BLACKSWAN CONFIRMED`);
      this.addLog(`MARKET CRASHED`);
      this.addLog(`BLACKSWAN CONFIRMED`);
      this.addLog(`MARKET CRASHED`);

      this.blackSwanTrigger += 33;
                  
      this.anomalyOverlay.setFill('#f30');
      this.anomalyOverlay.setText('FAILED\nMARKET CRASHED');
      this.anomalyOverlay.setAlpha(1);
      this.time.delayedCall(2222, () => {
        this.anomalyOverlay.setAlpha(0);
        this.anomalyOverlay.setText('');
      }, [], this);
    }

    this.saveGame();    
    
    // Spawn animated candles (non-interactive, visual only)
    for (let i = 0; i < 11; i++) {
      this.time.delayedCall(i * 200, () => {
        const candle = this.add.sprite(
          window.innerWidth / 2, 
          300, 
          success ? 'candle_bull' : 'candle_bear'
        ).setScale(0.69); 
        
        this.tweens.add({
          targets: candle,
          y: '-=100',
          alpha: 0,
          duration: 800,
          onComplete: () => candle.destroy()
        });
        
        // this.sound.play('beep');
      });
    }
  }
  
  
  createCandles() {
    this.createCandleTexture('candle_bull', 0x00ff00); // green
    this.createCandleTexture('candle_bear', 0xff0000); // red
    this.candleGroup = this.add.group();
  }

  createCandleTexture(key, color) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      
      // Common dimensions
      const wickWidth = 4;
      const bodyWidth = 20;
      const bodyHeight = 40;
      const wickX = 15;
      const totalHeight = 80;
      
      gfx.lineStyle(wickWidth, color);
      
      if (key.includes('bear')) {
          // BEARISH: Wick extends from top of body to high point
          gfx.beginPath();
          gfx.moveTo(wickX, 10);           // high price
          gfx.lineTo(wickX, 30);           // top of body
          gfx.strokePath();
          
          // Body from top to bottom
          gfx.fillStyle(color);
          gfx.fillRect(5, 30, bodyWidth, bodyHeight); // open > close
      } else {
        // Bullish: Open at bottom, close at top
        const openY = 60;
        const closeY = 20;
        const highY = 10;
        const lowY = 70;
        
        // Lower wick (low to close)
        gfx.beginPath();
        gfx.moveTo(15, lowY);
        gfx.lineTo(15, closeY);
        gfx.strokePath();
        
        // Body (open to close)
        gfx.fillStyle(color);
        gfx.fillRect(5, closeY, bodyWidth, openY - closeY);
      }
      
      gfx.generateTexture(key, 30, totalHeight);
      gfx.destroy();
  }

  startCandleSpawner() {
    this.candleSpawnEvent = this.time.addEvent({
        delay: 420,
        callback: this.spawnCandle,
        callbackScope: this,
        loop: true
    });
  }

  spawnCandle() {
    if (!this.isBlackSwanMode || this.candleGroup.getLength() >= this.maxCandles + 5) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const y = 50 + Math.random() * (height - 160);
    const x = Math.random() < 0.5 ? -64 : width + 64; // left or right    
    const isBear = this.blackSwanLevel < 3 ? true : Math.random() < 0.9;
    const candle = this.add.sprite(-20, y, isBear ? 'candle_bear' : 'candle_bull');
    
    candle.setScale(2);
    
    candle.setInteractive();
    candle.setData('isBear', isBear);
    candle.setData('speed', 6666 + Math.random() * 3333);
    
    candle.on('pointerdown', () => this.onCandleClick(candle));
    
    this.candleGroup.add(candle);
    
    // Fly across screen
    this.tweens.add({
        targets: candle,
        x: x < 0 ? width + 64 : -64,
        duration: candle.getData('speed'),
        ease: 'Linear',
        onComplete: () => candle.destroy()
    });
    
    // Next spawn
    this.candleSpawnEvent.delay = Math.random() * 1111;
  }

  onCandleClick(candle) {
    const isBear = candle.getData('isBear');
    
    if (isBear) {
      candle.setTexture('candle_bull');
      candle.setData('isBear', false);
      this.candlesConverted++;
      this.addLog('CANDLE CONVERTED');
    } else {
      candle.setTexture('candle_bear');
      candle.setData('isBear', true);
      this.addLog('HODL');
      this.candlesConverted = Math.max(0, this.candlesConverted--);
    }
    
    this.updateAnomalyUI();
    
    this.tweens.add({
      targets: candle,
      scale: 1.2,
      duration: 100,
      yoyo: true
    });
  } 

  createSettings() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const greenColor = '#0f0';
    const font = 'Share Tech Mono';

    // Gear button
    this.gearButton = this.add.image(width - 40, 40, 'gearIcon')
      .setTint(0x00ff00)
      .setScale(1)
      .setInteractive()
      .setDepth(1000);

    // Create settings menu (hidden by default)
    this.settingsMenu = this.add.container(width, height);
    this.settingsMenu.setDepth(1001);
    this.settingsMenu.setVisible(false);

    // Menu background
    const bg = this.add.rectangle(0, 0, 300, 300, 0x000000, 0.9);
    bg.setStrokeStyle(1, 0x00ff00);
    this.settingsMenu.add(bg);

    // Title
    const title = this.add.text(0, -100, 'SETTINGS', {
      fontFamily: font,
      fontSize: '18px',
      fill: greenColor
    }).setOrigin(0.5);
    this.settingsMenu.add(title);

    // Mint Score button
    const mintBtn = this.add.text(0, -40, 'MINT SCORE', {
      fontFamily: font,
      fontSize: '16px',
      fill: greenColor
    }).setOrigin(0.5).setInteractive();
    this.settingsMenu.add(mintBtn);

    // Audio toggle
    this.audioText = this.add.text(0, 0, `AUDIO: ${this.audioEnabled ? 'ON' : 'OFF'}`, {
      fontFamily: font,
      fontSize: '16px',
      fill: greenColor
    }).setOrigin(0.5).setInteractive();
    this.settingsMenu.add(this.audioText);

    // Flashes toggle
    this.flashesText = this.add.text(0, 40, `FLASHES: ${this.flashesEnabled ? 'ON' : 'OFF'}`, {
      fontFamily: font,
      fontSize: '16px',
      fill: greenColor
    }).setOrigin(0.5).setInteractive();
    this.settingsMenu.add(this.flashesText);
    
    // Skin Mod toggle
    this.skinModText = this.add.text(0, 80, `SKIN MOD: ${this.skinModEnabled ? 'ON' : 'OFF'}`, {
      fontFamily: font,
      fontSize: '16px',
      fill: greenColor
    }).setOrigin(0.5).setInteractive();
    this.settingsMenu.add(this.skinModText);

    // Close button
    const closeBtn = this.add.text(0, 130, 'CLOSE', {
      fontFamily: font,
      fontSize: '16px',
      fill: greenColor
    }).setOrigin(0.5).setInteractive();
    this.settingsMenu.add(closeBtn);

    // Button interactions
    this.gearButton.on('pointerdown', () => {
      this.toggleSettings();
    });

    this.audioText.on('pointerdown', () => {
      this.audioEnabled = !this.audioEnabled;
      this.audioText.setText(`AUDIO: ${this.audioEnabled ? 'ON' : 'OFF'}`);
    });

    this.flashesText.on('pointerdown', () => {
      this.flashesEnabled = !this.flashesEnabled;
      this.flashesText.setText(`FLASHES: ${this.flashesEnabled ? 'ON' : 'OFF'}`);
    });
    
    this.skinModText.on('pointerdown', () => {
      this.skinModEnabled = !this.skinModEnabled;
      this.skinModText.setText(`SKIN MOD: ${this.skinModEnabled ? 'ON' : 'OFF'}`);
    });
    
    mintBtn.on('pointerdown', () => {
      this.scene.launch('OnchainScene', {
        score: this.score,
        anomalyLevel: this.anomalyLevel,
        blackSwanLevel: this.blackSwanLevel,
        totalClicks: this.totalClicks
      });
      
      // Pause main game
      this.scene.pause();
    });

    closeBtn.on('pointerdown', () => {
      this.toggleSettings();
    });
  }
  
  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
    this.settingsMenu.setVisible(this.settingsOpen);
    if (this.settingsOpen) {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      this.settingsMenu.setPosition(width / 2, height / 2);
    }
  }
  
  resizeGame() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Re Scale 
    this.scale.resize(width, height);
    this.cameras.resize(width, height);

    // Reposition UI
    if (this.scoreDisplay) this.scoreDisplay.setPosition(width / 2, height - 50);
    if (this.levelText) this.levelText.setPosition(20, 20);
    if (this.anomalyOverlay) this.anomalyOverlay.setPosition(width / 2, height / 2);
    if (this.gearButton) this.gearButton.setPosition(width - 40, 40);
    if (this.settingsOpen) {
      this.settingsMenu.setPosition(width / 2, height / 2);
    }
  }
  
  shutdown() {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('orientationchange', this.orientationHandler);
  }
}
