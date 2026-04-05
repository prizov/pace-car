import { DRIVERS, TEAMS } from '../data/content.js';
import {
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
  makeTrackTexture,
  makeMinimapTexture,
} from '../render/textures.js';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key:'BootScene' }); }

  create() {
    // Generate car textures
    makeCarTexture(this, 'player_car', 0xCC0000, 0xC0C0C0, true);
    DRIVERS.forEach(d => {
      const t = TEAMS[d.team];
      const key = d.name.replace(/\s/g,'_').toLowerCase();
      makeCarTexture(this, key, t.body, t.accent);
      makeWreckTexture(this, key, t.body);
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
