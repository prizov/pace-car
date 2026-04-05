import { DRIVERS, TEAMS, TEAM_SPRITE_ASSETS } from '../data/content.js';
import {
  makeTextureFromImage,
  makeCarTexture,
  makeWreckTexture,
  makeSmokeTexture,
  makeExplosionTexture,
  makeJetTexture,
  makeMissileTexture,
  makeReticleTexture,
  makeGigarocketTexture,
  makeGigarocketFlameTexture,
  makeTankTexture,
  makeTankShellTexture,
  makeGigaCatTexture,
  makeGigaCatPawTexture,
  makeSealTexture,
  makeSealFartTexture,
  makeTrackTexture,
  makeMinimapTexture,
} from '../render/textures.js';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key:'BootScene' }); }

  preload() {
    this.load.image('pixellab_pace_car', 'assets/sprites/pixellab/pace-car.png');
    Object.entries(TEAM_SPRITE_ASSETS).forEach(([team, path]) => {
      this.load.image(`team_sprite_${team}`, path);
    });
  }

  create() {
    const renderedPaceCarSize = { width: 26, height: 42 };
    const renderedF1Size = { width: 32, height: 52 };
    const renderedF1WreckSize = { width: 28, height: 46 };
    const hasRenderedPaceCar = this.textures.exists('pixellab_pace_car');

    // Generate car textures
    if (hasRenderedPaceCar) {
      makeTextureFromImage(
        this,
        'pixellab_pace_car',
        'player_car',
        renderedPaceCarSize.width,
        renderedPaceCarSize.height,
        { flipY: true },
      );
    } else {
      makeCarTexture(this, 'player_car', 0xCC0000, 0xC0C0C0, true);
    }

    DRIVERS.forEach(d => {
      const t = TEAMS[d.team];
      const key = d.name.replace(/\s/g,'_').toLowerCase();
      const teamSpriteKey = `team_sprite_${d.team}`;
      const hasRenderedF1 = this.textures.exists(teamSpriteKey);

      if (hasRenderedF1) {
        makeTextureFromImage(
          this,
          teamSpriteKey,
          key,
          renderedF1Size.width,
          renderedF1Size.height,
          { flipY: true },
        );
        makeWreckTexture(this, key, t.body, renderedF1WreckSize.width, renderedF1WreckSize.height);
      } else {
        makeCarTexture(this, key, t.body, t.accent);
        makeWreckTexture(this, key, t.body);
      }
    });
    makeSmokeTexture(this);
    makeExplosionTexture(this);
    makeJetTexture(this);
    makeMissileTexture(this);
    makeReticleTexture(this);
    makeGigarocketTexture(this);
    makeGigarocketFlameTexture(this);
    makeTankTexture(this);
    makeTankShellTexture(this);
    makeGigaCatTexture(this);
    makeGigaCatPawTexture(this);
    makeSealTexture(this);
    makeSealFartTexture(this);
    makeTrackTexture(this);
    makeMinimapTexture(this);

    // Dot texture for minimap cars
    const gd = this.make.graphics({ x:0, y:0, add:false });
    gd.fillStyle(0xFFFFFF, 1); gd.fillCircle(4, 4, 4);
    gd.generateTexture('dot', 8, 8);
    gd.destroy();

    // Small debris piece
    const gdb = this.make.graphics({ x:0, y:0, add:false });
    gdb.fillStyle(0x333333, 1); gdb.fillRect(0,0,4,4);
    gdb.generateTexture('debris', 4, 4);
    gdb.destroy();

    this.scene.start('GameScene');
  }
}
