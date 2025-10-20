import { keccak256, toHex } from 'viem';

export class SponsorsScene extends Phaser.Scene {
  constructor() {
    super('SponsorsScene');
    this.account = null;
    this.isInitialized = false;
    this.selectedTier = 'bronze';
    this.form = {
      name: '',
      description: '',
      cta: '',
      logoUrl: '',
      website: ''
    };
  }

  init(data) {
    this.setSponsorParams = window.phaserGame?.web3Data?.setSponsorParams || null;
  }

  create() {
    this.addEventListeners();
    this.setupUI();
    this.createSponsorButton();
    this.createTierSelection();
    this.createFormInputs();
  }

  addEventListeners() {
    this.onSponsorResult = (e) => {
      const { success, message } = e.detail;

      if (success) {
        this.showSuccessAnimation('✨');
        this.statusText.setText(message).setColor('#00ff00');
      } else {
        this.statusText.setText(message).setColor('#ff0000');
      }

      this.time.delayedCall(4444, () => {
        this.statusText.setText('');
      });
    };

    document.addEventListener('sponsorize-result', this.onSponsorResult);
  }

  setupUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const green = '#0f0';
    const font = 'Share Tech Mono';

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0.9);

    // Title
    this.add.text(width / 2, 60, 'BECOME AN SPONSOR', {
      fontFamily: font,
      fontSize: '28px',
      fill: green
    }).setOrigin(0.5);

    // Connect Wallet Button
    this.connectBtn = this.add.text(width / 2, 120, 'CONNECT WALLET', {
      fontFamily: font,
      fontSize: '16px',
      fill: '#333',
      backgroundColor: green,
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.connectBtn.on('pointerdown', () => {
      document.dispatchEvent(new Event('open-wallet-modal'));
    });

    // Status text
    this.statusText = this.add.text(width / 2, height - 100, '', {
      fontFamily: font,
      fontSize: '20px',
      fill: green
    }).setOrigin(0.5);

    // Back button
    this.backBtn = this.add.text(width / 2, height - 40, 'BACK', {
      fontFamily: font,
      fontSize: '20px',
      fill: green
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.backBtn.on('pointerdown', () => this.goBack());
  }

  createFormInputs() {
    const width = this.cameras.main.width;
    const startY = 200;
    const spacing = 50;
    const labelX = width * 0.25;
    const inputX = width * 0.65;
    const green = '#0f0';
    const font = 'Share Tech Mono';

    const labels = [
      'Sponsor Name:',
      'Short Desc:',
      'Call to Action:',
      'Logo URL (IPFS):',
      'Website:'
    ];

    const placeholders = [
      'Acme Corp',
      'Revolutionizing Web3 gaming',
      'Play Now',
      'ipfs://Qm...',
      'https://acmecorp.com'
    ];

    this.inputFields = [];

    labels.forEach((label, i) => {
      // Label
      this.add.text(labelX, startY + i * spacing, label, {
        fontFamily: font,
        fontSize: '16px',
        fill: green
      }).setOrigin(0.5);

      // Input box 
      const inputBg = this.add.rectangle(inputX, startY + i * spacing, 300, 32, 0x222222)
        .setOrigin(0.5)
        .setStrokeStyle(1, '0x00ff00');

      const inputText = this.add.text(inputX, startY + i * spacing, placeholders[i], {
        fontFamily: font,
        fontSize: '14px',
        fill: '#aaa'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      this.inputFields.push({
        bg: inputBg,
        text: inputText,
        placeholder: placeholders[i],
        value: '',
        active: false
      });

      // Click to focus
      inputText.on('pointerdown', () => {
        this.focusInput(i);
      });
    });

    // Make keyboard input work
    this.input.keyboard.on('keydown', (event) => {
      const focused = this.inputFields.find(f => f.active);
      if (!focused) return;

      const key = event.key;

      if (key === 'Backspace') {
        focused.value = focused.value.slice(0, -1);
      } else if (key.length === 1 && event.key !== 'Shift' && event.key !== 'Control') {
        focused.value += key;
      }

      this.updateInputDisplay(focused);
    });
  }

  focusInput(index) {
    this.inputFields.forEach((field, i) => {
      field.active = i === index;
      field.text.setStyle({ fill: i === index ? '#00ff00' : '#aaa' });
    });
  }

  updateInputDisplay(field) {
    field.text.setText(field.value || field.placeholder);
  }

  createTierSelection() {
    const width = this.cameras.main.width;
    const y = 500;
    const font = 'Share Tech Mono';
    const tiers = ['bronze', 'silver', 'gold'];
    const colors = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' };
    const prices = { gold: '0.01 ETH', silver: '0.00069 ETH', bronze: '0.00042 ETH' };

    this.tierButtons = {};

    tiers.forEach((tier, i) => {
      const x = width * 0.25 + (i+1) * 120;
      const btn = this.add.text(x, y, tier.toUpperCase(), {
        fontFamily: font,
        fontSize: '24px',
        fill: '#111',
        backgroundColor: colors[tier]
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const priceText = this.add.text(x, y + 25, prices[tier], {
        fontFamily: font,
        fontSize: '16px',
        fill: colors[tier]
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        // Update selected
        this.selectedTier = tier;
        // Visual feedback
        Object.keys(this.tierButtons).forEach(t => {
          const b = this.tierButtons[t];
          b.setStyle({ backgroundColor: colors[t], fill: '#111' });
        });
        btn.setStyle({ backgroundColor: '#00ff00', fill: '#111' });
      });

      this.tierButtons[tier] = btn;
    });

    // Default selection visual
    this.time.delayedCall(100, () => {
      this.tierButtons[this.selectedTier].setStyle({ backgroundColor: '#00ff00', fill: '#111' });
    });

    // Label
    this.add.text(width * 0.5, y - 40, 'SELECT SPONSORSHIP TIER:', {
      fontFamily: font,
      fontSize: '18px',
      fill: '#0f0'
    }).setOrigin(0.5);
  }

  createSponsorButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.sponsorBtn = this.add.text(width / 2, 640, 'SUBMIT SPONSORSHIP', {
      fontFamily: 'Share Tech Mono',
      fontSize: '18px',
      fill: '#333',
      backgroundColor: '#0f0',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(1);

    this.sponsorBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.submitSponsorship();
    });
  }

  submitSponsorship() {
    // Gather all input values
    this.inputFields.forEach((field, i) => {
      switch (i) {
        case 0: this.form.name = field.value; break;
        case 1: this.form.description = field.value; break;
        case 2: this.form.cta = field.value; break;
        case 3: this.form.logoUrl = field.value; break;
        case 4: this.form.website = field.value; break;
      }
    });

    // Validate
    if (!this.form.name || !this.form.description || !this.form.cta || !this.form.logoUrl || !this.form.website) {
      this.statusText.setText('Please fill all fields.').setColor('#ff0000');
      return;
    }
/*
    if (!this.form.logoUrl.startsWith('ipfs://')) {
      this.statusText.setText('Logo URL must start with ipfs://').setColor('#ff0000');
      return;
    }
*/
    if (!this.form.website.startsWith('http://') && !this.form.website.startsWith('https://')) {
      this.statusText.setText('Website must be a valid URL.').setColor('#ff0000');
      return;
    }

    if (!this.setSponsorParams) {
      this.statusText.setText('Sponsor system not ready.').setColor('#ff0000');
      return;
    }

    // Set params for onchain call
    this.setSponsorParams({
      tier: this.selectedTier,
      name: this.form.name,
      description: this.form.description,
      cta: this.form.cta,
      logoUrl: this.form.logoUrl,
      website: this.form.website
    });

    this.statusText.setText('Submitting sponsorship... Confirm in wallet.').setColor('#00ff00');

    // Trigger the actual on-chain call
    this.time.delayedCall(1111, () => {
      document.getElementById('sponsor-trigger')?.click();
    });
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
    document.removeEventListener('sponsorize-result', this.onSponsorResult);
  }
}
