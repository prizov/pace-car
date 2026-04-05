import { W, H } from '../constants.js';

export class WinScene extends Phaser.Scene {
  constructor() { super({ key:'WinScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  }

  create() {
    // High score
    const hs = parseInt(localStorage.getItem('paceCar_hs') || '0');
    if (this.finalScore > hs) localStorage.setItem('paceCar_hs', this.finalScore);
    const highScore = Math.max(hs, this.finalScore);

    // Background
    this.add.rectangle(W/2, H/2, W, H, 0x000000);
    this.add.rectangle(W/2, H/2, W-40, H-40, 0x111111);

    // Chequered pattern top/bottom
    for (let i = 0; i < 20; i++) {
      const col = (i % 2 === 0) ? 0xFFFFFF : 0x000000;
      this.add.rectangle(i * 64 + 32, 30, 60, 40, col);
      this.add.rectangle(i * 64 + 32, H - 30, 60, 40, col);
    }

    this.add.text(W/2, 120, 'RACE NEUTRALISED', {
      fontSize:'64px', fontFamily:'monospace', color:'#FFEE00',
      stroke:'#000', strokeThickness:10,
    }).setOrigin(0.5);

    this.add.text(W/2, 220, '🏁 ALL 22 CARS DESTROYED 🏁', {
      fontSize:'28px', fontFamily:'monospace', color:'#FFFFFF',
      stroke:'#000', strokeThickness:6,
    }).setOrigin(0.5);

    this.add.text(W/2, 320, `FINAL SCORE: ${this.finalScore.toLocaleString()}`, {
      fontSize:'40px', fontFamily:'monospace', color:'#FF6600',
      stroke:'#000', strokeThickness:8,
    }).setOrigin(0.5);

    this.add.text(W/2, 390, `HIGH SCORE: ${highScore.toLocaleString()}`, {
      fontSize:'28px', fontFamily:'monospace', color:'#AAFFAA',
      stroke:'#000', strokeThickness:6,
    }).setOrigin(0.5);

    if (this.finalScore >= highScore && this.finalScore > 0) {
      this.add.text(W/2, 440, '★ NEW HIGH SCORE! ★', {
        fontSize:'24px', fontFamily:'monospace', color:'#FFFF00',
        stroke:'#000', strokeThickness:5,
      }).setOrigin(0.5);
    }

    this.add.text(W/2, 520, '"The Safety Car has gone completely rogue.\nFIA officials are baffled."', {
      fontSize:'18px', fontFamily:'monospace', color:'#AAAAAA',
      stroke:'#000', strokeThickness:4,
      align:'center'
    }).setOrigin(0.5);

    const restart = () => this.scene.start('GameScene');

    let btn;
    if (this.isTouchDevice) {
      const buttonBg = this.add.circle(W/2, 620, 88, 0x00a86b, 0.92)
        .setStrokeStyle(4, 0xffffff, 0.24)
        .setInteractive({ useHandCursor: false });
      const buttonLabel = this.add.text(W/2, 610, 'PLAY\nAGAIN', {
        fontSize:'26px', fontFamily:'monospace', color:'#FFFFFF',
        stroke:'#000', strokeThickness:6,
        align:'center',
      }).setOrigin(0.5);
      const buttonHint = this.add.text(W/2, 700, 'tap to restart', {
        fontSize:'16px', fontFamily:'monospace', color:'#CCFFEE',
        stroke:'#000', strokeThickness:4,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: [buttonBg, buttonLabel],
        alpha: 0.55,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });

      buttonBg.on('pointerdown', restart);
      buttonLabel.setInteractive({ useHandCursor: false }).on('pointerdown', restart);
      btn = buttonBg;
    } else {
      btn = this.add.text(W/2, 620, '[ PRESS SPACE TO RACE AGAIN ]', {
        fontSize:'26px', fontFamily:'monospace', color:'#FFFFFF',
        stroke:'#000', strokeThickness:6,
      }).setOrigin(0.5).setInteractive();

      this.tweens.add({
        targets: btn,
        alpha: 0.2,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });

      btn.on('pointerover', () => btn.setColor('#FFEE00'));
      btn.on('pointerout',  () => btn.setColor('#FFFFFF'));
      btn.on('pointerdown', restart);
    }

    this.input.keyboard.on('keydown-SPACE', restart);
  }
}
