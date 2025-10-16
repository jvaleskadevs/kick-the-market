import { getLeaderboard } from "../lib/getLeaderboard.js";

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
    this.leaderboardData = [];
    this.isLoading = true;
  }

  init(data) {
    // Optional: receive data from calling scene
  }

  preload() {
    // No assets to preload for now
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Styling
    const font = 'Share Tech Mono';
    const greenColor = '#0f0';
    const bgColor = '#000';
    const borderColor = 0x00ff00;

    // Background
    this.cameras.main.setBackgroundColor(bgColor);

    // Header
    const header = this.add.text(width / 2, 60, 'LEADERBOARD', {
      fontFamily: font,
      fontSize: '24px',
      fill: greenColor,
      stroke: '#003300',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#00ff00',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5).setDepth(10);

    // Back button
    const backButton = this.add.text(width / 2, height - 60, 'BACK', {
      fontFamily: font,
      fontSize: '18px',
      fill: greenColor,
      backgroundColor: '#000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('MainScene');
    });

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2, 'LOADING...', {
      fontFamily: font,
      fontSize: '20px',
      fill: '#0f9',
      stroke: '#003300',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Fetch leaderboard
    getLeaderboard().then(data => {
      this.isLoading = false;
      this.loadingText.destroy();

      if (data.length === 0) {
        this.add.text(width / 2, height / 2, 'NO DATA', {
          fontFamily: font,
          fontSize: '20px',
          fill: '#f00'
        }).setOrigin(0.5);
        return;
      }

      this.leaderboardData = data;
      this.displayLeaderboard();
    });
  }

  displayLeaderboard() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const font = 'Share Tech Mono';
    const greenColor = '#0f0';

    const startY = 120;
    const rowHeight = 30;

    // Table headers
    const headers = [
      { text: 'RANK', x: 60 },
      { text: 'ADDRESS', x: 180 },
      { text: 'SCORE', x: 360 },
      { text: 'ANOMALY', x: 460 },
      { text: 'BLACKSWAN', x: 560 },
      { text: 'KICKS', x: 660 }
    ];

    headers.forEach(h => {
      this.add.text(h.x, startY, h.text, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0ff',
        stroke: '#003333',
        strokeThickness: 1
      }).setOrigin(0);
    });

    // Divider line
    const line = this.add.graphics();
    line.lineStyle(1, 0x00ff00, 0.5);
    line.lineBetween(50, startY + 20, width - 50, startY + 20);

    // Rows
    this.leaderboardData.forEach((entry, index) => {
      const y = startY + 40 + (index * rowHeight);

      // Rank
      this.add.text(60, y, `${index + 1}.`, {
        fontFamily: font,
        fontSize: '16px',
        fill: index === 0 ? '#0f0' : '#0f9'
      }).setOrigin(0);

      // Shortened address
      const shortAddr = entry.to ? `${entry.to.slice(0, 6)}...${entry.to.slice(-4)}` : 'ANON';
      this.add.text(180, y, shortAddr, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);

      // Score
      this.add.text(360, y, `${entry.score || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f0'
      }).setOrigin(0);

      // Anomaly Level
      this.add.text(460, y, `${entry.anomalyLevel || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);

      // BlackSwan Level
      this.add.text(560, y, `${entry.blackSwanLevel || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);
      
      // totalKicks
      this.add.text(660, y, `${entry.totalKicks || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);
    });

    // Add scanline overlay for style
    const scanlines = this.add.graphics();
    scanlines.setAlpha(0.05);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineBetween(0, y, width, y);
    }
  }

  update() {
    // Optional: add subtle glitch effect
    if (this.isLoading) return;

    if (Math.random() < 0.001) {
      this.cameras.main.flash(111, 0, 255, 0);
    }
  }

  resizeGame() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.resize(width, height);

    // Reposition elements if needed
    this.children.getArray().forEach(child => {
      if (child.y === 60) child.x = width / 2; // header
      if (child.y === this.cameras.main.height - 60) child.x = width / 2; // back button
    });
  }
}
