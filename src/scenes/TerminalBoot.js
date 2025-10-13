export class TerminalScene extends Phaser.Scene {
  create() {
    const style = {
      fontFamily: 'Share Tech Mono',
      fontSize: '18px',
      fill: '#0f0',
      stroke: '#090',
      strokeThickness: 2
    };

    let y = 100;
    const lines = [
      'INITIALIZING KICKBOT v4.2.0...',
      'LOADING KERNEL MODULES...',
      'AUTHENTICATING USER: [REDACTED]...',
      'FIREWALL: ACTIVE',
      'LOADING CHARTS...',
      'SECURITY ALERT: ANOMALY DETECTED',
      'BLACKSWAN EVENT ON GOING...',
      'FATAL ERROR',
      'FATAL ERROR',
      'FATAL ERROR',
      'FATAL ERROR',
      'FATAL ERR'
    ];

    lines.forEach((line, i) => {
      this.time.delayedCall(i * 800, () => {
        this.add.text(69, y + i*40, line, style);
        //this.sound.play('type');
      });
    });

    this.time.delayedCall(666, () => {
      this.scene.start('BootScene');
    });
  }
}
