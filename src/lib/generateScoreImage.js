/**
 * Score NFT SVG Generator - JavaScript/Node.js version
 * Generates the same cyberpunk-themed SVG as the Solidity contract
 */

export default class GenerateScoreImage {
  
  /**
   * Generate SVG for score NFT
   * @param {number} score - Score value (0-999999999)
   * @param {number} anomalyLevel - Anomaly level (0-9999)
   * @param {number} blackswanLevel - Blackswan level (0-9999)
   * @param {number} totalClicks - Total clicks count
   * @returns {string} SVG markup
   */
  generateSVG(score, anomalyLevel, blackswanLevel, totalClicks = 0) {
    // Validate inputs
    if (score < 0 || score > 999999999) {
      throw new Error('Score out of range (0-999999999)');
    }
    if (anomalyLevel < 0 || anomalyLevel > 9999) {
      throw new Error('Anomaly level out of range (0-9999)');
    }
    if (blackswanLevel < 0 || blackswanLevel > 9999) {
      throw new Error('Blackswan level out of range (0-9999)');
    }

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" style="background:#000">',
      this._generateDefs(),
      this._generateBackground(),
      this._generateBorders(),
      this._generateTitle(),
      this._generateScoreDisplay(score),
      this._generateMetrics(anomalyLevel, blackswanLevel),
      this._generateClicks(totalClicks),
      this._generateDecoration(),
      '</svg>'
    ].join('');
  }

  _generateDefs() {
    return `<defs>
      <style>
        @font-face{font-family:"Share Tech Mono",monospace}
        text{fill:#0f0;font-family:"Courier New",monospace;}
        .title{font-size:24px;font-weight:700;letter-spacing:2px}
        .score{font-size:64px;font-weight:700;letter-spacing:-2px}
        .label{font-size:20px;opacity:0.7;letter-spacing:1px}
        .value{font-size:24px;font-weight:700}
        .clicks{font-size:48px;font-weight:700;letter-spacing:1px}
        .glow{filter:drop-shadow(0 0 8px #0f0)}
      </style>
    </defs>`;
  }

  _generateBackground() {
    return [
      '<rect width="500" height="500" fill="#000"/>',
      '<rect x="10" y="10" width="480" height="480" fill="none" stroke="#0f0" stroke-width="2" opacity="0.3"/>'
    ].join('');
  }

  _generateBorders() {
    return [
      '<rect x="30" y="30" width="440" height="440" fill="none" stroke="#0f0" stroke-width="1" opacity="0.5"/>',
      '<line x1="30" y1="100" x2="470" y2="100" stroke="#0f0" stroke-width="1" opacity="0.3"/>',
      '<line x1="30" y1="250" x2="470" y2="250" stroke="#0f0" stroke-width="1" opacity="0.3"/>',
      '<line x1="30" y1="350" x2="470" y2="350" stroke="#0f0" stroke-width="1" opacity="0.3"/>',
    ].join('');
  }

  _generateTitle() {
    return '<text x="250" y="80" text-anchor="middle" class="title glow">KICK THE MARKET SCORE</text>';
  }

  _generateScoreDisplay(score) {
    return [
      '<text x="250" y="140" text-anchor="middle" class="label">SCORE</text>',
      `<text x="250" y="220" text-anchor="middle" class="score glow">${score}</text>`,
      '<rect x="200" y="245" width="100" height="3" fill="#0f0" opacity="0.5"/>'
    ].join('');
  }

  _generateMetrics(anomalyLevel, blackswanLevel) {
    return [
      // Anomaly Level
      '<text x="90" y="290" class="label">ANOMALY LVL</text>',
      `<text x="155" y="320" class="value">${anomalyLevel}</text>`,
      
      // Blackswan Level
      '<text x="280" y="290" class="label">BLACKSWAN LVL</text>',
      `<text x="350" y="320" class="value">${blackswanLevel}</text>`,
    ].join('');
  }

  _generateClicks(totalClicks) {
    return [
      '<text x="250" y="388" text-anchor="middle" class="label">TOTAL CLICKS</text>',
      `<text x="250" y="444" text-anchor="middle" class="clicks glow">${totalClicks.toLocaleString()}</text>`
    ].join('');
  }

  _generateDecoration() {
    return [
      // Corner blocks (on borders)
      '<rect x="30" y="30" width="15" height="15" fill="#0f0" opacity="0.8"/>',
      '<rect x="455" y="30" width="15" height="15" fill="#0f0" opacity="0.8"/>',
      '<rect x="30" y="455" width="15" height="15" fill="#0f0" opacity="0.8"/>',
      '<rect x="455" y="455" width="15" height="15" fill="#0f0" opacity="0.8"/>',
      
      // Mid-edge blocks (on borders)
      '<rect x="30" y="240" width="10" height="10" fill="#0f0" opacity="0.6"/>',
      '<rect x="460" y="240" width="10" height="10" fill="#0f0" opacity="0.6"/>',
      '<rect x="240" y="30" width="10" height="10" fill="#0f0" opacity="0.6"/>',
      '<rect x="240" y="460" width="10" height="10" fill="#0f0" opacity="0.6"/>',
      
      // Subtle random blocks scattered around (avoiding text areas)
      '<rect x="175" y="115" width="4" height="4" fill="#0f0" opacity="0.15"/>',
      '<rect x="330" y="125" width="3" height="3" fill="#0f0" opacity="0.2"/>',
      '<rect x="395" y="165" width="5" height="5" fill="#0f0" opacity="0.15"/>',
      '<rect x="85" y="175" width="3" height="3" fill="#0f0" opacity="0.18"/>',
      '<rect x="410" y="225" width="4" height="4" fill="#0f0" opacity="0.2"/>',
      '<rect x="65" y="235" width="3" height="3" fill="#0f0" opacity="0.15"/>',
      '<rect x="425" y="345" width="5" height="5" fill="#0f0" opacity="0.18"/>',
      '<rect x="55" y="355" width="4" height="4" fill="#0f0" opacity="0.2"/>',
      '<rect x="185" y="405" width="3" height="3" fill="#0f0" opacity="0.15"/>',
      '<rect x="325" y="415" width="4" height="4" fill="#0f0" opacity="0.18"/>',
      '<rect x="410" y="430" width="3" height="3" fill="#0f0" opacity="0.2"/>',
      '<rect x="75" y="425" width="4" height="4" fill="#0f0" opacity="0.15"/>',
      
      // Status indicator
      //'<circle cx="250" cy="445" r="4" fill="#0f0" class="glow"/>',
      //'<text x="250" y="463" text-anchor="middle" class="label">MINTED_ONCHAIN</text>'
    ].join('');
  }

  /**
   * Get just the SVG as a data URI
   * @param {number} score - Score value
   * @param {number} anomalyLevel - Anomaly level
   * @param {number} blackswanLevel - Blackswan level
   * @returns {string} SVG data URI
   */
  getSVGDataURI(score, anomalyLevel, blackswanLevel, totalClicks) {
    const svg = this.generateSVG(score, anomalyLevel, blackswanLevel, totalClicks);
    const utf8Bytes = new TextEncoder().encode(svg);
    let binaryString = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binaryString += String.fromCharCode(utf8Bytes[i]);
    }
    const svgBase64 = btoa(binaryString);
    return `data:image/svg+xml;base64,${svgBase64}`;
  }
}
