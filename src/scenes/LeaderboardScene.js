import { getLeaderboard } from "../lib/getLeaderboard.js";

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
    this.leaderboardData = [];
    this.currentLeaderboardTab = "free";
    this.isLoading = true;
    this.sponsorAds = []; 
    this.adsContainer = null;
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

    // FREE Leadearboard button
    const freeLeaderboardButton = this.add.text((width / 2) - 200, 100, 'FREE LEAGUE', {
      fontFamily: font,
      fontSize: '18px',
      fill: greenColor,
      backgroundColor: '#000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    freeLeaderboardButton.on('pointerdown', () => {
      this.currentLeaderboardTab = 'free';
      this.fetchLeaderboard();
    });
        
    // PAID Leadearboard button
    const paidLeaderboardButton = this.add.text((width / 2) + 200, 100, 'ETH LEAGUE', {
      fontFamily: font,
      fontSize: '18px',
      fill: greenColor,
      backgroundColor: '#000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    paidLeaderboardButton.on('pointerdown', () => {
      this.currentLeaderboardTab = 'paid';
      this.fetchLeaderboard();
    });

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

    this.leaderboardContainer = this.add.container();
    this.leaderboardGraphics = [];
    this.adsContainer = this.add.container();

    this.fetchLeaderboard();
  }
  
  fetchLeaderboard() {
    getLeaderboard(this.currentLeaderboardTab).then(data => {
      this.isLoading = false;
      this.loadingText.destroy();
      this.clearLeaderboard();

      if (data.length === 0) {
        const width = this.cameras.main.width;
        const text = this.add.text(width / 2, height / 2, 'NO DATA', {
          fontFamily: font,
          fontSize: '20px',
          fill: '#f00'
        }).setOrigin(0.5);
        this.leaderboardContainer.add(text);
        return;
      }

      this.leaderboardData = data;
      
      if (this.leaderboardData > 0) {
        this.displayLeaderboard();
      }      
      this.displaySponsorAds();
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
      const header = this.add.text(h.x, startY, h.text, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0ff',
        stroke: '#003333',
        strokeThickness: 1
      }).setOrigin(0);
      this.leaderboardContainer.add(header);
    });

    // Divider line
    const line = this.add.graphics();
    line.lineStyle(1, 0x00ff00, 0.5);
    line.lineBetween(50, startY + 20, width - 50, startY + 20);
    this.leaderboardGraphics.push(line);

    // Rows
    this.leaderboardData.forEach((entry, index) => {
      const y = startY + 40 + (index * rowHeight);

      // Rank
      const rankText = this.add.text(60, y, `${index + 1}.`, {
        fontFamily: font,
        fontSize: '16px',
        fill: index === 0 ? '#0f0' : '#0f9'
      }).setOrigin(0);
      this.leaderboardContainer.add(rankText);

      // Shortened address
      const shortAddr = entry.to ? `${entry.to.slice(0, 6)}...${entry.to.slice(-4)}` : 'ANON';
      const addressText = this.add.text(180, y, shortAddr, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);
      this.leaderboardContainer.add(addressText);

      // Score
      const scoreText = this.add.text(360, y, `${entry.score || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f0'
      }).setOrigin(0);
      this.leaderboardContainer.add(scoreText);      

      // Anomaly Level
      const anomalyText = this.add.text(460, y, `${entry.anomalyLevel || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);
      this.leaderboardContainer.add(anomalyText);

      // BlackSwan Level
      const blackSwanText = this.add.text(560, y, `${entry.blackSwanLevel || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);
      this.leaderboardContainer.add(blackSwanText);
      
      // totalKicks
      const kicksText = this.add.text(660, y, `${entry.totalKicks || 0}`, {
        fontFamily: font,
        fontSize: '16px',
        fill: '#0f9'
      }).setOrigin(0);
      this.leaderboardContainer.add(kicksText);
    });

    // Add scanline overlay for style
    const scanlines = this.add.graphics();
    scanlines.setAlpha(0.05);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineBetween(0, y, width, y);
    }
    this.leaderboardGraphics.push(scanlines);
  }
  
  displaySponsorAds() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const font = 'Share Tech Mono';
    const greenColor = '#0f0';
    const borderColor = 0x00ff00;
    const bgPadding = 50;
    const adWidth = width - bgPadding * 2;

    // After leaderboard
    const lastRow = this.leaderboardData.length > 0 ? 
      160 + (this.leaderboardData.length * 30) + 40 : 
      height / 2;

    const AdsHeader = this.add.text(width / 2, lastRow + 40, 'SPONSORED BY', {
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

    let y = lastRow + 120;

    // === MOCK SPONSOR DATA ===
    this.sponsorAds = [
      { tier: 'Gold', name: 'Onchain Blocks', cta: 'JOIN CHANNEL', desc: 'Let the fun begin, anon blockmate', website: 'https://farcaster.xyz/channel/onchainblocks', logo: 'https://via.placeholder.com' },
      { tier: 'Silver', name: 'DIAMOND LABS', cta: 'BUILD WITH US', desc: 'Building the future we deserve', website: 'https://farcaster.xyz/channel/onchainblocks', logo: 'https://via.placeholder.com' },
      { tier: 'Silver', name: 'DIAMOND LABS', cta: 'BUILD WITH US', desc: 'Building the future we deserve', website: 'https://farcaster.xyz/channel/onchainblocks', logo: 'https://via.placeholder.com' },
      { tier: 'Bronze', name: 'OBA', cta: 'GENERATE IMAGE', desc: 'Onchain Blocks Agency', website: 'https://obagents.vercel.app', logo: 'https://via.placeholder.com/' },
      { tier: 'Bronze', name: 'OBA', cta: 'BEEP BOOP', desc: 'Onchain Blocks Agency', website: 'https://obagents.vercel.app', logo: 'https://via.placeholder.com/' },
      { tier: 'Bronze', name: 'OBA', cta: 'GENERATE GIFS', desc: 'Onchain Blocks Agency', website: 'https://obagents.vercel.app', logo: 'https://via.placeholder.com/' }
    ];

    // --- GOLD AD ---
    this.renderSponsorAd(this.sponsorAds[0], adWidth + 20, 120, width / 2, y, 1.0);
    y += 130;

    // --- SILVER ADS (2) ---
    const silverW = (adWidth / 2) - 10;
    const offsetX = (adWidth / 2) + 20;

    this.renderSponsorAd(this.sponsorAds[1], silverW, 120, width / 2 - offsetX / 2, y, 1);
    this.renderSponsorAd(this.sponsorAds[2], silverW, 120, width / 2 + offsetX / 2, y, 1);
    y += 130;

    // --- BRONZE ADS (3) ---
    const bronzeW = adWidth / 3 - 12;
    const spacing = (adWidth - 3 * bronzeW) / 2;

    for (let i = 3; i < 6; i++) {
      const x = (width / 2 - adWidth / 2) + spacing + (i - 3) * (bronzeW + spacing) + bronzeW / 2;
      this.renderSponsorAd(this.sponsorAds[i], bronzeW, 120, x - 20, y, 1);
    }
  }

  renderSponsorAd(ad, w, h, x, y, scale) {
    const font = 'Share Tech Mono';
    const greenColor = '#0f0';
    const borderColor = 0x00ff00;

    // Background box
    const box = this.add.graphics();
    box.lineStyle(1, borderColor, 1);
    box.fillStyle(0x000000, 1);
    box.strokeRect(x - w / 2, y - h / 2, w, h);
    box.setDepth(5);
    this.adsContainer.add(box);

    // === CENTERED CONTENT GROUP ===
    const contentWidth = 280 * scale; // Estimate width of logo + name + desc
    const contentHeight = 80;
    const contentX = 80 + x - contentWidth / 2; // Left edge of content block
    const contentY = y - contentHeight / 2; // Top of content block

    // Logo size
    const logoSize = 36 * scale;

    // Logo: positioned at calculated left
    const logoX = contentX + logoSize / 2;
    const logo = this.add.image(logoX, contentY + 16, ad.logo)
      .setDisplaySize(logoSize, logoSize)
      .setOrigin(0.5)
      .setDepth(6);
    this.adsContainer.add(logo);

    // Name: to the right of logo
    const nameX = contentX + logoSize + 10;
    const name = this.add.text(nameX, contentY + 8, ad.name, {
      fontFamily: font,
      fontSize: `${Math.floor(18 * scale)}px`,
      fill: '#0f0',
      stroke: '#003300',
      strokeThickness: 2
    }).setOrigin(0).setDepth(6);
    this.adsContainer.add(name);

    // Description: below logo
    const desc = this.add.text(logoX - logoSize / 2, contentY + 36, ad.desc, {
      fontFamily: font,
      fontSize: `${Math.floor(12 * scale)}px`,
      fill: '#0f9',
      wordWrap: { width: w * 0.6 }
    }).setOrigin(0).setDepth(6);
    this.adsContainer.add(desc);

    // CTA Button – centered in ad box, below description
    const buttonWidth = w * 0.85;
    const buttonHeight = 28;
    const buttonX = x - buttonWidth / 2;
    const buttonY = y + 20;

    const button = this.add.graphics();
    button.fillStyle(0x00ff00, 1);
    button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    button.setDepth(7);

    const buttonText = this.add.text(x, buttonY + buttonHeight / 2, ad.cta.toUpperCase(), {
      fontFamily: font,
      fontSize: '14px',
      fill: '#000',
      stroke: '#003300',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(8);

    // Interactive
    button.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    ).on('pointerdown', () => {
      window.open(ad.website, '_blank');
    });

    this.adsContainer.add(button);
    this.adsContainer.add(buttonText);
  }
  
  clearLeaderboard() {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.removeAll(true);
    }

    this.leaderboardGraphics.forEach(graphic => graphic.destroy());
    this.leaderboardGraphics = [];
    this.clearAds();
  }

  clearAds() {
    if (this.adsContainer) this.adsContainer.removeAll(true);
  } 

  update() {
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
