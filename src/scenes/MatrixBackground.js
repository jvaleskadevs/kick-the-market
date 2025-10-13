export class MatrixBackground {
  constructor(scene) {
    this.scene = scene;
    this.chars = 'ɿɿɘɛɜɣɼɂŧƧƆƦɕɷѽҿԬ԰ԱԲԳՇՈ՚՟աբգդեթժիլխծկհձղճմյնոչպջռսվտրցւփքօֆ՚isorzqjwbdpmacehkx';
    this.streams = [];
    this.width = scene.cameras.main.width;
    this.height = scene.cameras.main.height;
    this.fontSize = 14;
    this.columns = Math.floor(this.width / this.fontSize);

    this.create();
  }

  create() {
    // One stream per column
    for (let x = 0; x < this.columns; x++) {
      this.streams.push({
        x: x * this.fontSize,
        y: Math.random() * -1000, // random start above
        speed: 1 + Math.random() * 3,
        length: Math.floor(5 + Math.random() * 20),
        chars: [],
        opacity: Math.random() * 0.5 + 0.5
      });
    }

    // Run every 100ms
    this.scene.time.addEvent({
      delay: 100,
      callback: this.update,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    const ctx = this.scene.grafics.context;
    const w = this.scene.sys.game.config.width;
    const h = this.scene.sys.game.config.height;

    // Reuse canvas context
    const graphics = this.scene.grafics;

    // Clear with fade (trail effect)
    graphics.clear();
    graphics.fillStyle('#000', 0.05);
    graphics.fillRect(0, 0, w, h);

    // Draw each stream
    this.streams.forEach(stream => {
      stream.y += stream.speed;
      if (stream.y > this.height && Math.random() > 0.97) {
        stream.y = -10;
      }

      // Generate random chars
      if (!stream.chars.length || Math.random() > 0.95) {
        stream.chars = Array(stream.length).fill().map(() => this.chars.charAt(Math.random() * this.chars.length));
      }

      // Draw characters
      stream.chars.forEach((char, i) => {
        const y = stream.y - i * this.fontSize;
        if (y < 0 || y > this.height) return;

        const alpha = stream.opacity * (i === 0 ? 1 : 0.3 + (stream.length - i) / stream.length * 0.7);
        const size = i === 0 ? 'bold ' : '';
        const font = `${size}${this.fontSize}px Share Tech Mono`;
        const fill = `rgba(0, 255, 0, ${alpha})`;

        this.scene.grafics.fillStyle(fill);
        this.scene.grafics.fillRect(stream.x, y, this.fontSize, this.fontSize);
        this.scene.grafics.fillStyle('#000');
        this.scene.grafics.fillRect(stream.x + 2, y + 2, this.fontSize - 4, this.fontSize - 4);
        this.scene.grafics.fillStyle('#0f0');
        //this.scene.grafics.setFont(font);
        this.scene.grafics.textAlign = 'center';
        //this.scene.grafics.fillText(char, stream.x + this.fontSize / 2, y + this.fontSize - 2);
      });
    });
  }
}
