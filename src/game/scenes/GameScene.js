import {
  W,
  H,
  PLAYER_MAX_SPEED,
  PLAYER_TURBO_SPEED,
  AI_MAX_SPEED,
  BASE_DAMAGE,
  TURBO_DURATION,
  TURBO_COOLDOWN,
  JET_SPEED,
  MISSILE_SPEED,
  MISSILE_COOLDOWN,
  MISSILE_RANGE,
  GIGAROCKET_SPEED,
  GIGAROCKET_CHARGE_SPEED,
  GIGAROCKET_CHARGE_DURATION,
  TANK_SPEED,
  TANK_TURN,
  TANK_SHELL_SPEED,
  TANK_SHELL_COOLDOWN,
  GIGACAT_SPEED,
  GIGACAT_POUNCE_SPEED,
  GIGACAT_POUNCE_DURATION,
  GIGACAT_POUNCE_RADIUS,
  GIGACAT_POUNCE_COOLDOWN,
} from '../constants.js';
import {
  TEAMS,
  DRIVERS,
  COMMENTATOR_GENERIC,
  COMMENTATOR_SPECIAL,
  WAYPOINTS,
  WP_COUNT,
} from '../data/content.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { mmX, mmY } from '../render/textures.js';

export class GameScene extends Phaser.Scene {
  constructor() { super({ key:'GameScene' }); }

  init() {
    this.devFlags = window.__PACE_CAR_DEV__ || {};
    this.score = 0;
    this.carsRemaining = 22;
    this.lastDestroyTime = 0;
    this.audio = new AudioEngine();
    this.audioStarted = false;
    this.preRace = true;
    this.turboActive = false;
    this.turboTimer = 0;
    this.turboCooldownTimer = 0;
    this.isJet = false;
    this.missileCooldown = 0;
    this.targetedCar = null;
    this.isGigarocket = false;
    this.gigarocketCharging = false;
    this.gigarocketChargeTimer = 0;
    this.gigarocketTrailEmitter = null;
    this.isTank = false;
    this.tankShellCooldown = 0;
    this.isGigaCat = false;
    this.gigaCatPouncing = false;
    this.gigaCatPounceTimer = 0;
    this.gigaCatPounceCooldown = 0;
  }

  create() {
    // ── Track ──
    this.trackImg = this.add.image(0, 0, 'track').setOrigin(0, 0);

    // ── Player — P23 (safety car), behind entire grid on S/F straight ──
    // S/F runs east (+x) at y≈280. Last grid car is at x≈1330, player behind at x≈1230.
    this.player = this.physics.add.sprite(1230, 280, 'player_car');
    this.player.setDepth(10);
    this.player.body.setSize(14, 28);
    this.player.body.setMaxVelocity(PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
    this.player.body.setDrag(300, 300);
    this.player.angle = 90; // facing east (direction of travel)
    this.playerDamageSprite = 0; // cosmetic only

    // ── Camera ──
    this.cameras.main.setBounds(0, 0, 4000, 3000);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.0);

    // ── Debris group (static, no physics) ──
    this.debrisGroup = this.add.group();

    // ── Wreck group (static obstacles) ──
    this.wreckGroup = this.physics.add.staticGroup();

    // ── F1 Cars ──
    this.f1Cars = [];
    this.f1CarSprites = this.physics.add.group();

    // Grid: 2-wide formation on S/F straight.
    // S/F runs east (+x) at y≈280. Race direction = increasing x.
    // Pole (P1) at x≈1880 (closest to T01). P22 at x≈1330. Player at x≈1230.
    DRIVERS.forEach((driver, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2; // 0=left lane (slightly north), 1=right lane (slightly south)
      const gridX = 1880 - row * 50;
      const gridY = 278 + (col === 0 ? -16 : 16);

      // All cars start pointing east, heading toward wp[0]
      let wpIndex = 0;

      const key = driver.name.replace(/\s/g,'_').toLowerCase();

      const sprite = this.physics.add.sprite(gridX, gridY, key);
      sprite.setDepth(9);
      sprite.setAngle(90); // all cars face east at start
      sprite.body.setSize(14, 28);
      sprite.body.setMaxVelocity(AI_MAX_SPEED, AI_MAX_SPEED);

      // Determine initial state
      let hp = 100;
      let state = 0; // 0=normal,1=damaged,2=critical,3=destroyed
      let speedMult = 1.0;

      if (driver.special === 'stroll') { hp = 67; state = 1; speedMult = 0.6; }
      if (driver.special === 'alonso') hp = 130; // 4-hit car
      if (driver.team === 'astonmartin') speedMult *= 0.7;

      const car = {
        sprite, driver, key,
        wpIndex,
        hp, maxHp: hp,
        state,
        speedMult,
        dead: false,
        smokeEmitter: null,
        shakeTimer: 0,
        aggroTimer: 0, // verstappen
        swerveAngle: 0,
      };

      // Smoke for Aston Martin from start
      if (driver.team === 'astonmartin') {
        car.smokeEmitter = this.createSmokeEmitter(sprite, state === 1 ? 0.8 : 0.4);
      }

      this.f1Cars.push(car);
      this.f1CarSprites.add(sprite);
      sprite._carData = car;
    });


    // ── Collisions: player ↔ F1 cars ──
    this.physics.add.overlap(
      this.player,
      this.f1CarSprites,
      this.handleCollision,
      null,
      this
    );

    // ── Missiles ──
    this.missileGroup = this.physics.add.group();
    this.physics.add.overlap(
      this.missileGroup,
      this.f1CarSprites,
      this.handleMissileHit,
      (missile, carSprite) => carSprite._carData && !carSprite._carData.dead,
      this
    );

    // ── Tank shells ──
    this.tankShellGroup = this.physics.add.group();
    this.physics.add.overlap(
      this.tankShellGroup,
      this.f1CarSprites,
      this.handleTankShellHit,
      (shell, carSprite) => carSprite._carData && !carSprite._carData.dead,
      this
    );

    // ── Targeting reticle sprite (world-space, pulsing image) ──
    this.reticleSprite = this.add.image(0, 0, 'reticle')
      .setDepth(20).setAlpha(0).setOrigin(0.5, 0.5);

    // ── Input ──
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    // Start audio on first input
    this.input.keyboard.on('keydown', () => {
      if (!this.audioStarted) { this.audio.init(); this.audioStarted = true; }
    });
    this.input.on('pointerdown', () => {
      if (!this.audioStarted) { this.audio.init(); this.audioStarted = true; }
    });

    // ── HUD (fixed camera) ──
    this.createHUD();

    // ── Minimap ──
    this.createMinimap();

    // ── Commentator popup ──
    this.commentatorText = this.add.text(W/2, H - 60, '', {
      fontSize:'18px', fontFamily:'monospace', color:'#FFFF00',
      stroke:'#000000', strokeThickness:4,
      align:'center'
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100).setAlpha(0);

    // ── Combo flash ──
    this.comboText = this.add.text(W/2, H/2 - 60, '', {
      fontSize:'36px', fontFamily:'monospace', color:'#FF6600',
      stroke:'#000', strokeThickness:6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    // ── Driver death banner ──
    this.deathBannerText = this.add.text(W/2, H - 120, '', {
      fontSize:'22px', fontFamily:'monospace', color:'#FFFFFF',
      stroke:'#000', strokeThickness:5,
      backgroundColor:'#00000088',
      padding:{x:12,y:6}
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100).setAlpha(0);

    // ── Screen flash overlay ──
    this.flashRect = this.add.rectangle(W/2, H/2, W, H, 0xFFFFFF, 0)
      .setScrollFactor(0).setDepth(200);

    // Norris special overlay
    this.norrisBanner = this.add.text(W/2, H/2 - 20, 'WORLD CHAMPION\nDESTROYED', {
      fontSize:'52px', fontFamily:'monospace', color:'#FF8000',
      stroke:'#000', strokeThickness:8, align:'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Hamilton slow-mo flag
    this.hamiltonSlowmo = false;
    this.hamiltonSlowmoTimer = 0;

    // ── Sponsor boards ──
    this.createSponsorBoards();

    if (this.devFlags.debug) {
      this.createDebugOverlay();
    }

    // ── Start sequence ──
    if (this.devFlags.skipIntro) this.startRaceNow();
    else this.startLightsSequence();
  }

  // ── Sponsor / advertising boards around the circuit ──
  createSponsorBoards() {
    // [x, y, width, height, bgColor, textColor, label]
    const boards = [
      // ── S/F grandstand (above straight, y < 250) ──
      [1460, 195, 130, 30, 0xCC0000, '#FFFFFF', 'FORMULA 1'],
      [1610, 195, 120, 30, 0xEEEEEE, '#000000', 'PIRELLI'],
      [1745, 195, 120, 30, 0x1A1A1A, '#CCA000', 'ROLEX'],
      [1880, 195, 110, 30, 0xFF0000, '#FFCC00', 'DHL'],
      // ── T01 Abbey — outside left of track ──
      [1794, 840, 120, 28, 0x007A33, '#FFFFFF', 'HEINEKEN'],
      [1794, 872, 120, 28, 0xFF9900, '#000000', 'AWS'],
      // ── T03 Village — outside right ──
      [2262, 1570, 130, 28, 0x00594F, '#FFFFFF', 'ARAMCO'],
      [2262, 1602, 130, 28, 0x0051FF, '#FF00AA', 'ALPINE F1'],
      // ── T04 Loop — outside left ──
      [1840, 1780, 120, 28, 0x1B3F8B, '#CC0000', 'RED BULL'],
      [1840, 1812, 120, 28, 0xFF8000, '#000000', 'McLAREN'],
      // ── Wellington / T06 Brooklands — south wall ──
      [2560, 1430, 130, 28, 0x005AFF, '#FFFFFF', 'CRYPTO.COM'],
      [2560, 1462, 130, 28, 0x1A1A1A, '#00D2BE', 'MERCEDES'],
      // ── Hangar straight — north wall ──
      [2720, 456, 130, 28, 0xCC0000, '#FFFF00', 'FERRARI'],
      [2720, 488, 130, 28, 0xFF8000, '#0090D0', 'McLAREN'],
      // ── T07 apex — east side ──
      [2895, 490, 120, 28, 0x1A1A1A, '#CCA000', 'ROLEX'],
      // ── Long east straight — south wall ──
      [3000, 592, 130, 28, 0xFF9900, '#000000', 'AWS'],
      [3160, 592, 120, 28, 0xCC0000, '#FFFFFF', 'FORMULA 1'],
      // ── T08 / T09 — east wall ──
      [3670, 1240, 120, 28, 0x005AFF, '#FFFFFF', 'FIA'],
      [3670, 1272, 130, 28, 0x007A33, '#FFFFFF', 'HEINEKEN'],
      // ── T10 bottom-right — north of track ──
      [2900, 1975, 130, 28, 0x00594F, '#FFFFFF', 'ARAMCO'],
      [2900, 2007, 130, 28, 0xFF0000, '#FFCC00', 'DHL'],
      // ── Bottom straight — south wall ──
      [2100, 2490, 120, 28, 0x1A1A1A, '#888888', 'AUDI'],
      [1940, 2490, 130, 28, 0xFF8000, '#000000', 'McLAREN'],
      [1760, 2490, 120, 28, 0xCC0000, '#FFFFFF', 'FORMULA 1'],
      // ── T15 Stowe — east side ──
      [ 992, 1490, 120, 28, 0x1A1A1A, '#CCA000', 'ROLEX'],
      [ 992, 1522, 120, 28, 0x00594F, '#FFFFFF', 'ARAMCO'],
      // ── T17 hangar north — east side ──
      [ 956, 742, 120, 28, 0xFF9900, '#000000', 'AWS'],
      [ 956, 774, 130, 28, 0x1B3F8B, '#CC0000', 'RED BULL'],
      // ── T18 — south (below track) ──
      [1080, 348, 130, 28, 0x005AFF, '#FF00AA', 'WILLIAMS F1'],
      [1080, 380, 120, 28, 0xEEEEEE, '#000000', 'PIRELLI'],
    ];

    boards.forEach(([x, y, w, h, bgCol, txtCol, label]) => {
      // Board background
      this.add.rectangle(x + w/2, y + h/2, w, h, bgCol, 0.92)
        .setDepth(3)
        .setStrokeStyle(1, 0xFFFFFF, 0.3);
      // White border accent
      this.add.rectangle(x + w/2, y + 2, w, 3, 0xFFFFFF, 0.5).setDepth(3);
      this.add.rectangle(x + w/2, y + h - 2, w, 3, 0xFFFFFF, 0.5).setDepth(3);
      // Text label
      this.add.text(x + w/2, y + h/2, label, {
        fontSize: '10px', fontFamily: 'Arial Black, monospace',
        color: txtCol, fontStyle: 'bold',
      }).setOrigin(0.5, 0.5).setDepth(4);
    });

    // Large corner banners (taller, more prominent)
    const bigBoards = [
      // S/F pit straight — vertical side boards
      [1395, 150, 20, 80, 0xCC0000, '#FFFFFF', 'F1'],
      [1960, 150, 20, 80, 0xCC0000, '#FFFFFF', 'F1'],
    ];
    bigBoards.forEach(([x, y, w, h, bgCol, txtCol, label]) => {
      this.add.rectangle(x + w/2, y + h/2, w, h, bgCol, 0.95).setDepth(3);
      this.add.text(x + w/2, y + h/2, label, {
        fontSize: '11px', fontFamily: 'Arial Black, monospace',
        color: txtCol, fontStyle: 'bold',
      }).setOrigin(0.5, 0.5).setDepth(4);
    });
  }

  // ── Formation grid → lights out ──
  startLightsSequence() {
    // Semi-transparent dark overlay
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.72)
      .setScrollFactor(0).setDepth(300);

    const t1 = this.add.text(W/2, H/2 - 200, '2026 FIA FORMULA ONE WORLD CHAMPIONSHIP', {
      fontSize:'14px', fontFamily:'monospace', color:'#AAAAAA',
      stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const t2 = this.add.text(W/2, H/2 - 175, 'BRITISH GRAND PRIX — SILVERSTONE CIRCUIT', {
      fontSize:'20px', fontFamily:'monospace', color:'#FFFFFF',
      stroke:'#000', strokeThickness:5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const t3 = this.add.text(W/2, H/2 - 140, '★  FORMATION LAP COMPLETE  ★', {
      fontSize:'16px', fontFamily:'monospace', color:'#FFFF00',
      stroke:'#000', strokeThickness:4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const t4 = this.add.text(W/2, H/2 - 110, '[ Safety Car — Grid Position: P23 (Last) ]', {
      fontSize:'13px', fontFamily:'monospace', color:'#FF6666',
      stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Lights panel
    const panel = this.add.rectangle(W/2, H/2, 380, 90, 0x0a0a0a)
      .setScrollFactor(0).setDepth(301)
      .setStrokeStyle(3, 0x444444);

    // 5 light bulbs
    const LIGHT_COUNT = 5;
    const SPACING = 60;
    const startX = W/2 - (LIGHT_COUNT - 1) * SPACING / 2;
    const lightY = H/2;

    // Each light is a graphics object
    const lights = Array.from({ length: LIGHT_COUNT }, (_, idx) => {
      const lx = startX + idx * SPACING;
      const g = this.add.graphics().setScrollFactor(0).setDepth(302);
      // Draw unlit state
      g.fillStyle(0x1a0000, 1); g.fillCircle(lx, lightY, 22);
      g.fillStyle(0x330000, 1); g.fillCircle(lx, lightY, 17);
      return { g, lx, ly: lightY };
    });

    const statusText = this.add.text(W/2, H/2 + 70, 'CARS ON THE GRID', {
      fontSize:'18px', fontFamily:'monospace', color:'#FFCC00',
      stroke:'#000', strokeThickness:4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const lightUp = (idx) => {
      const { g, lx, ly } = lights[idx];
      g.clear();
      g.fillStyle(0xFF0000, 1);  g.fillCircle(lx, ly, 24);
      g.fillStyle(0xFF3333, 1);  g.fillCircle(lx, ly, 18);
      g.fillStyle(0xFF9999, 0.5); g.fillCircle(lx, ly - 5, 7);
    };

    // Sequence: 1 light every 800ms
    for (let i = 0; i < LIGHT_COUNT; i++) {
      this.time.delayedCall(600 + i * 800, () => {
        lightUp(i);
        statusText.setText(i < LIGHT_COUNT - 1 ? 'GET READY...' : 'LIGHTS OUT IMMINENT...');
      });
    }

    // Lights out — random delay 500–1500ms after 5th light
    const outDelay = 600 + LIGHT_COUNT * 800 + Phaser.Math.Between(500, 1500);
    this.time.delayedCall(outDelay, () => {
      // Kill all lights
      lights.forEach(({ g, lx, ly }) => {
        g.clear();
        g.fillStyle(0x111111, 1); g.fillCircle(lx, ly, 24);
        g.fillStyle(0x1a1a1a, 1); g.fillCircle(lx, ly, 17);
      });
      statusText.setText('LIGHTS OUT! GO GO GO!').setColor('#FF6600');
      this.flashScreen(0x00CC00);

      this.time.delayedCall(500, () => {
        this.preRace = false;
        // Fade everything out
        const uiItems = [overlay, panel, statusText, t1, t2, t3, t4, ...lights.map(l => l.g)];
        this.tweens.add({
          targets: uiItems,
          alpha: 0,
          duration: 600,
          onComplete: () => uiItems.forEach(o => o.destroy()),
        });
      });
    });
  }

  startRaceNow() {
    this.preRace = false;
    this.updateHUD();
  }

  // ── Smoke emitter ──
  createSmokeEmitter(target, intensity=0.5) {
    const emitter = this.add.particles(target.x, target.y, 'smoke', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.6 * intensity, end: 0 },
      lifespan: 1200,
      frequency: intensity > 0.7 ? 60 : 120,
      gravityY: -20,
      tint: intensity > 0.7 ? 0x111111 : 0x555555,
      quantity: 1,
    });
    emitter.setDepth(8);
    return emitter;
  }

  // ── HUD ──
  createHUD() {
    const cam = this.cameras.main;

    // Mode indicator (below minimap on left side)
    this.modeText = this.add.text(16, 136, '🚗 CAR  [T=TRANSFORM | SPC=TURBO]', {
      fontSize:'12px', fontFamily:'monospace', color:'#AAFFAA',
      stroke:'#000', strokeThickness:3,
    }).setScrollFactor(0).setDepth(90);

    this.scoreText = this.add.text(W - 16, 16, 'SCORE: 0', {
      fontSize:'20px', fontFamily:'monospace', color:'#FFFFFF',
      stroke:'#000', strokeThickness:4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(90);

    this.carsText = this.add.text(W - 16, 44, 'CARS: 22 / 22', {
      fontSize:'16px', fontFamily:'monospace', color:'#AAFFAA',
      stroke:'#000', strokeThickness:3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(90);

    this.speedText = this.add.text(W - 16, 68, '', {
      fontSize:'14px', fontFamily:'monospace', color:'#FFAAAA',
      stroke:'#000', strokeThickness:3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(90);

    // Turbo/Missile bar title
    this.turboBarTitle = this.add.text(W - 16, 92, 'TURBO', {
      fontSize:'11px', fontFamily:'monospace', color:'#AAAAAA',
      stroke:'#000', strokeThickness:2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(90);

    // Bar background
    this.add.rectangle(W - 16 - 60, 108, 120, 10, 0x333333)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(90);
    // Bar fill (drawn as a rectangle we resize each frame)
    this.turboBarFill = this.add.rectangle(W - 16 - 60, 108, 120, 10, 0x00FFFF)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(91);
    this.turboBarLabel = this.add.text(W - 16, 115, 'READY', {
      fontSize:'10px', fontFamily:'monospace', color:'#00FFFF',
      stroke:'#000', strokeThickness:2,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(92);
  }

  createDebugOverlay() {
    this.debugText = this.add.text(16, 168, '', {
      fontSize:'11px', fontFamily:'monospace', color:'#FFFFFF',
      stroke:'#000', strokeThickness:3,
      backgroundColor:'#00000088',
      padding:{ x:8, y:6 },
    }).setScrollFactor(0).setDepth(95);
  }

  // ── Minimap ──
  createMinimap() {
    const MX = 10, MY = 10;
    const S = 0.05;

    this.minimapBg = this.add.image(MX, MY, 'minimap_bg')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(90).setAlpha(0.9);

    // Player dot (white)
    this.minimapPlayer = this.add.image(MX, MY, 'dot')
      .setScrollFactor(0).setDepth(91).setTint(0xFFFFFF).setScale(0.8);

    // Car dots
    this.minimapDots = this.f1Cars.map(car => {
      const dot = this.add.image(MX, MY, 'dot')
        .setScrollFactor(0).setDepth(91).setTint(TEAMS[car.driver.team].body).setScale(0.6);
      return dot;
    });
  }

  updateMinimap() {
    const MX = 10, MY = 10;
    this.minimapPlayer.setPosition(MX + mmX(this.player.x) - 4, MY + mmY(this.player.y) - 4);
    this.f1Cars.forEach((car, i) => {
      const dot = this.minimapDots[i];
      if (car.dead) { dot.setVisible(false); return; }
      dot.setPosition(MX + mmX(car.sprite.x) - 3, MY + mmY(car.sprite.y) - 3);
    });
  }

  // ── Collision handler ──
  handleCollision(player, carSprite) {
    const car = carSprite._carData;
    if (!car || car.dead || this.preRace) return;

    // Gigarocket charge — instant annihilation, no questions asked
    if (this.gigarocketCharging) {
      car.hp = 0; car.state = 3;
      this.destroyCar(car, true);
      // Camera shake per kill during charge
      this.cameras.main.shake(120, 0.015);
      return;
    }

    const playerSpeed = Math.hypot(player.body.velocity.x, player.body.velocity.y);
    const normSpeed = playerSpeed / PLAYER_MAX_SPEED;
    if (normSpeed < 0.15) return; // too slow to matter

    // Angle factor: head-on vs glancing
    const playerAngleRad = Phaser.Math.DegToRad(player.angle - 90);
    const toCarX = carSprite.x - player.x;
    const toCarY = carSprite.y - player.y;
    const dist = Math.hypot(toCarX, toCarY) || 1;
    const dot = (Math.cos(playerAngleRad) * toCarX/dist + Math.sin(playerAngleRad) * toCarY/dist);
    const angleFactor = Math.max(0.3, Math.abs(dot));

    const damage = normSpeed * angleFactor * BASE_DAMAGE * 3;
    car.hp -= damage;

    const isHighSpeed = normSpeed > 0.8;
    this.audio.playHit(isHighSpeed);

    // Update state
    const prevState = car.state;
    if (car.hp <= 0 && car.state < 3) {
      car.state = 3;
    } else if (car.hp < car.maxHp * 0.3 && car.state < 2) {
      car.state = 2;
    } else if (car.hp < car.maxHp * 0.67 && car.state < 1) {
      car.state = 1;
    }

    // Instant kill on very high-speed direct hit while critical
    if (car.state === 3 || (isHighSpeed && normSpeed > 0.95 && car.state === 2)) {
      car.state = 3;
      car.hp = 0;
    }

    if (car.state === 3 && !car.dead) {
      this.destroyCar(car, isHighSpeed);
      return;
    }

    // State transition effects
    if (car.state !== prevState) {
      if (car.state === 1) {
        car.speedMult = Math.min(car.speedMult, 0.6);
        car.smokeEmitter = this.createSmokeEmitter(carSprite, 0.5);
        car.shakeTimer = 2000;
        // Driver shakes fist (tint flash)
        this.tweens.add({ targets: carSprite, tint: 0xFF8800, duration: 150, yoyo: true, repeat: 2 });
      } else if (car.state === 2) {
        car.speedMult = Math.min(car.speedMult, 0.3);
        if (car.smokeEmitter) car.smokeEmitter.destroy();
        car.smokeEmitter = this.createSmokeEmitter(carSprite, 0.9);
      }
    }

    // Verstappen special: briefly charge at player
    if (car.driver.special === 'verstappen' && car.state >= 1 && car.aggroTimer <= 0) {
      car.aggroTimer = 3000;
    }

    // Bounce player back a bit
    const pushX = -Math.cos(playerAngleRad) * normSpeed * 150;
    const pushY = -Math.sin(playerAngleRad) * normSpeed * 150;
    player.body.velocity.x += pushX;
    player.body.velocity.y += pushY;
  }

  // ── Destroy car ──
  destroyCar(car, isHighSpeed) {
    car.dead = true;
    this.carsRemaining--;

    const x = car.sprite.x, y = car.sprite.y;
    const driver = car.driver;

    // Stop smoke
    if (car.smokeEmitter) { car.smokeEmitter.destroy(); car.smokeEmitter = null; }

    // Hide live sprite
    car.sprite.setVisible(false);
    car.sprite.body.enable = false;

    // Wreck sprite
    const wreck = this.wreckGroup.create(x, y, car.key + '_wreck');
    wreck.setDepth(5).setAngle(car.sprite.angle + Phaser.Math.Between(-20, 20));
    wreck.refreshBody();

    // Explosion particles
    this.createExplosion(x, y);

    // Driver helmet bounce
    const helmet = this.add.circle(x, y, 6, 0xFFFFFF);
    helmet.setDepth(12);
    this.tweens.add({
      targets: helmet,
      x: x + Phaser.Math.Between(-60, 60),
      y: y + Phaser.Math.Between(-60, 60),
      alpha: 0,
      duration: 1200,
      ease: 'Bounce.Out',
      onComplete: () => helmet.destroy()
    });

    // Debris scatter
    for (let i = 0; i < 8; i++) {
      const d = this.add.image(x, y, 'debris');
      d.setDepth(6);
      const tx = x + Phaser.Math.Between(-80, 80);
      const ty = y + Phaser.Math.Between(-80, 80);
      this.tweens.add({
        targets: d,
        x: tx, y: ty,
        angle: Phaser.Math.Between(0, 360),
        duration: 800,
        ease: 'Quad.Out'
      });
      this.debrisGroup.add(d);
    }

    // Audio
    this.audio.playExplosion();

    // Scoring
    let pts = 100;
    let comboMsg = '';

    if (isHighSpeed) pts += 50;

    const now = this.time.now;
    if (now - this.lastDestroyTime < 2000 && this.lastDestroyTime > 0) {
      pts += 200;
      comboMsg = 'MULTI-WRECK! +200';
    }
    this.lastDestroyTime = now;

    // Special bonuses
    if (driver.special === 'norris') {
      pts *= 3;
      comboMsg = '3× WORLD CHAMPION BONUS!';
      this.showNorrisBanner();
    }
    if (driver.special === 'hamilton') {
      pts += 150;
      this.hamiltonSlowmo = true;
      this.hamiltonSlowmoTimer = 2000;
    }
    if (driver.special === 'alonso') pts += 100;
    if (driver.special === 'stroll') pts += 10;
    if (driver.special === 'lawson') { pts += 250; comboMsg = 'LAWSON BONUS! +250'; }

    this.score += pts;

    // Flash screen
    this.flashScreen(driver.special === 'norris' ? 0xFF8000 : 0xFFFFFF);

    // Combo flash
    if (comboMsg) this.showComboText(comboMsg);

    // Death banner
    this.showDeathBanner(driver.name, TEAMS[driver.team].body);

    // Commentator
    const line = COMMENTATOR_SPECIAL[driver.special] ||
      COMMENTATOR_GENERIC[Phaser.Math.Between(0, COMMENTATOR_GENERIC.length - 1)];
    this.showCommentator(line);

    // Update HUD
    this.updateHUD();

    // Hamilton slow-mo effect
    if (driver.special === 'hamilton') {
      this.time.delayedCall(100, () => {
        this.tweens.add({
          targets: this,
          duration: 500,
          onStart: () => { this.physics.world.timeScale = 0.2; },
          onComplete: () => {
            this.time.delayedCall(1500, () => { this.physics.world.timeScale = 1.0; });
          }
        });
      });
    }

    // Check win
    if (this.carsRemaining <= 0) {
      this.time.delayedCall(2000, () => this.scene.start('WinScene', { score: this.score }));
    }
  }

  createExplosion(x, y) {
    // Large orange burst
    const emitter = this.add.particles(x, y, 'explosion', {
      speed: { min: 80, max: 300 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 20,
      stopAfter: 20,
      angle: { min: 0, max: 360 },
      blendMode: 'ADD',
    });
    emitter.setDepth(15);

    // Black smoke cloud
    const smoke = this.add.particles(x, y, 'smoke', {
      speed: { min: 20, max: 80 },
      scale: { start: 1, end: 3 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2500,
      quantity: 12,
      stopAfter: 12,
      tint: 0x111111,
      gravityY: -30,
    });
    smoke.setDepth(14);

    // Auto-cleanup
    this.time.delayedCall(3000, () => { emitter.destroy(); smoke.destroy(); });
  }

  flashScreen(color=0xFFFFFF) {
    this.tweens.killTweensOf(this.flashRect);
    this.flashRect.setFillStyle(color, 1);
    this.flashRect.setAlpha(0.7);
    this.tweens.add({
      targets: this.flashRect,
      alpha: 0,
      duration: 400,
      ease: 'Power2'
    });
  }

  showNorrisBanner() {
    this.norrisBanner.setAlpha(1);
    this.tweens.add({
      targets: this.norrisBanner,
      alpha: 0,
      duration: 2500,
      delay: 1500,
    });
  }

  showComboText(msg) {
    this.comboText.setText(msg).setAlpha(1);
    this.tweens.add({
      targets: this.comboText,
      alpha: 0,
      y: this.comboText.y - 40,
      duration: 1500,
      onComplete: () => { this.comboText.y = H/2 - 60; }
    });
  }

  showDeathBanner(name, teamColor) {
    const hex = '#' + teamColor.toString(16).padStart(6, '0');
    this.deathBannerText.setText(`💥 ${name} ELIMINATED`).setColor(hex).setAlpha(1);
    this.tweens.add({
      targets: this.deathBannerText,
      alpha: 0,
      duration: 2000,
      delay: 1000,
    });
  }

  showCommentator(text) {
    this.commentatorText.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.commentatorText,
      alpha: 0,
      duration: 3000,
      delay: 2000,
    });
  }

  updateHUD() {
    this.scoreText.setText('SCORE: ' + this.score.toLocaleString());
    this.carsText.setText(`CARS: ${this.carsRemaining} / 22`);
  }

  getModeName() {
    if (this.gigaCatPouncing || this.isGigaCat) return 'gigacat';
    if (this.gigarocketCharging || this.isGigarocket) return 'gigarocket';
    if (this.isTank) return 'tank';
    if (this.isJet) return 'jet';
    return 'car';
  }

  getDebugState() {
    const speed = Math.round(Math.hypot(this.player.body.velocity.x, this.player.body.velocity.y));
    return {
      ready: true,
      scene: this.scene.key,
      preRace: this.preRace,
      mode: this.getModeName(),
      score: this.score,
      carsRemaining: this.carsRemaining,
      speed,
      turboActive: this.turboActive,
      turboCooldownTimer: this.turboCooldownTimer,
      missileCooldown: this.missileCooldown,
      tankShellCooldown: this.tankShellCooldown,
      gigarocketCharging: this.gigarocketCharging,
      gigaCatPouncing: this.gigaCatPouncing,
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        angle: Math.round(this.player.angle),
      },
      targetedCar: this.targetedCar?.driver?.name ?? null,
    };
  }

  updateDebugOverlay() {
    if (!this.debugText) return;
    const state = this.getDebugState();
    this.debugText.setText([
      `scene: ${state.scene}`,
      `mode: ${state.mode}`,
      `preRace: ${state.preRace}`,
      `speed: ${state.speed}`,
      `cars: ${state.carsRemaining}`,
      `score: ${state.score}`,
      `turbo: ${state.turboActive ? 'on' : 'off'}`,
      `missileCd: ${Math.ceil(state.missileCooldown)}`,
      `shellCd: ${Math.ceil(state.tankShellCooldown)}`,
      `rocket: ${state.gigarocketCharging ? 'burning' : 'idle'}`,
      `cat: ${state.gigaCatPouncing ? 'pouncing' : 'grounded'}`,
      `target: ${state.targetedCar ?? '-'}`,
    ]);
  }

  // ── AI movement ──
  updateAI(delta) {
    this.f1Cars.forEach(car => {
      if (car.dead) return;
      if (this.preRace) { car.sprite.body.setVelocity(0, 0); return; }

      const sprite = car.sprite;

      // Verstappen aggro mode
      if (car.aggroTimer > 0) {
        car.aggroTimer -= delta;
        const dx = this.player.x - sprite.x;
        const dy = this.player.y - sprite.y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = AI_MAX_SPEED * 0.8;
        sprite.body.setVelocity(dx/dist * speed, dy/dist * speed);
        sprite.setAngle(Phaser.Math.RadToDeg(Math.atan2(dy, dx)) + 90);
        if (car.smokeEmitter) car.smokeEmitter.setPosition(sprite.x, sprite.y);
        return;
      }

      // Normal waypoint following
      let wp = WAYPOINTS[car.wpIndex];
      const dx = wp.x - sprite.x;
      const dy = wp.y - sprite.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 30) {
        car.wpIndex = (car.wpIndex + 1) % WP_COUNT;
        wp = WAYPOINTS[car.wpIndex];
      }

      const targetSpeed = AI_MAX_SPEED * wp.s * car.speedMult;
      const angle = Math.atan2(dy, dx);

      // Slight swerve for damaged cars
      let swerve = 0;
      if (car.state >= 1) {
        car.swerveAngle += delta * 0.003 * (car.state + 1);
        swerve = Math.sin(car.swerveAngle) * 0.4 * car.state;
      }

      sprite.body.setVelocity(
        Math.cos(angle + swerve) * targetSpeed,
        Math.sin(angle + swerve) * targetSpeed
      );
      sprite.setAngle(Phaser.Math.RadToDeg(angle + swerve) + 90);

      // Move smoke emitter
      if (car.smokeEmitter) car.smokeEmitter.setPosition(sprite.x, sprite.y);
    });
  }

  // ── Player movement ──
  updatePlayer(delta) {
    if (this.preRace) { this.player.body.setVelocity(0, 0); return; }

    // ── R to respawn on nearest waypoint ──
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      let best = 0, bestDist = Infinity;
      WAYPOINTS.forEach((wp, i) => {
        const d = Math.hypot(wp.x - this.player.x, wp.y - this.player.y);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      const wp = WAYPOINTS[best];
      const wpNext = WAYPOINTS[(best + 1) % WP_COUNT];
      this.player.setPosition(wp.x, wp.y);
      this.player.body.setVelocity(0, 0);
      const angle = Math.atan2(wpNext.y - wp.y, wpNext.x - wp.x);
      this.player.setAngle(Phaser.Math.RadToDeg(angle) + 90);
      this.flashScreen(0xFFFF00);
    }

    // ── T to toggle jet/car transform ──
    if (Phaser.Input.Keyboard.JustDown(this.tKey)) {
      this.transformToggle();
    }

    const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown;
    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;

    // ── GigaCat mid-pounce — override input ──
    if (this.gigaCatPouncing) {
      this.gigaCatPounceTimer -= delta;
      // Arc scale: rises to 1.7× then comes back down (looks like jumping)
      const progress = 1 - this.gigaCatPounceTimer / GIGACAT_POUNCE_DURATION;
      const arcScale = 1 + Math.sin(progress * Math.PI) * 0.7;
      this.player.setScale(arcScale);
      // Keep velocity going, slight drag
      this.player.body.velocity.x *= 0.995;
      this.player.body.velocity.y *= 0.995;
      // Tint flicker orange→white during jump
      this.player.setTint(Math.sin(this.time.now * 0.04) > 0 ? 0xFF8C00 : 0xFFEE88);
      this.gigaCatPounceCooldown = Math.max(0, this.gigaCatPounceCooldown - delta);
      this.updateTurboBar();
      if (this.gigaCatPounceTimer <= 0) this.gigaCatLand();
      return;
    }

    // ── Gigarocket charge — override all other input ──
    if (this.gigarocketCharging) {
      this.gigarocketChargeTimer -= delta;
      const rad = Phaser.Math.DegToRad(this.player.angle - 90);
      this.player.body.velocity.x = Math.cos(rad) * GIGAROCKET_CHARGE_SPEED;
      this.player.body.velocity.y = Math.sin(rad) * GIGAROCKET_CHARGE_SPEED;
      // Move trail emitter
      if (this.gigarocketTrailEmitter) {
        const trailRad = rad + Math.PI; // behind
        this.gigarocketTrailEmitter.setPosition(
          this.player.x + Math.cos(trailRad) * 50,
          this.player.y + Math.sin(trailRad) * 50
        );
      }
      // Audio at max pitch
      this.audio.setSpeed(1.0);
      const kmhCharge = Math.round(GIGAROCKET_CHARGE_SPEED * 0.5);
      this.speedText.setText(kmhCharge + ' km/h 🚀');
      this.updateTurboBar();

      if (this.gigarocketChargeTimer <= 0) {
        // Charge spent — auto-revert to car
        this.gigarocketCharging = false;
        this.isGigarocket = false;
        this._stopGigarocketTrail();
        this.player.body.setVelocity(0, 0);
        this.player.setTexture('player_car');
        this.player.body.setSize(14, 28);
        this.player.body.setMaxVelocity(PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
        this.modeText.setText('🚗 CAR  [T=TRANSFORM | SPC=TURBO]').setColor('#AAFFAA');
        this.turboBarTitle.setText('TURBO').setColor('#AAAAAA');
        this.showComboText('💥 ROCKET SPENT!');
        this.flashScreen(0xFF6600);
        this.cameras.main.shake(300, 0.02);
      }
      return; // no further input during charge
    }

    // ── Space: mode-dependent action ──
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.activatePrimaryAbility();
    }

    // Tick turbo timers (car mode only)
    if (!this.isJet && !this.isGigarocket && !this.isTank && !this.isGigaCat) {
      if (this.turboActive) {
        this.turboTimer -= delta;
        if (this.turboTimer <= 0) {
          this.turboActive = false;
          this.turboCooldownTimer = TURBO_COOLDOWN;
        }
      } else if (this.turboCooldownTimer > 0) {
        this.turboCooldownTimer -= delta;
      }
    }

    // Tick gigacat cooldown during normal walking
    if (this.isGigaCat && this.gigaCatPounceCooldown > 0) {
      this.gigaCatPounceCooldown = Math.max(0, this.gigaCatPounceCooldown - delta);
    }

    const maxSpeed = this.isJet ? JET_SPEED
      : this.isGigarocket ? GIGAROCKET_SPEED
      : this.isTank ? TANK_SPEED
      : this.isGigaCat ? GIGACAT_SPEED
      : (this.turboActive ? PLAYER_TURBO_SPEED : PLAYER_MAX_SPEED);
    const ACCEL = this.isJet ? 1800
      : this.isGigarocket ? 400
      : this.isTank ? 500
      : this.isGigaCat ? 700
      : (this.turboActive ? 2200 : 600);
    const TURN  = this.isJet ? 95
      : this.isGigarocket ? 55
      : this.isTank ? TANK_TURN
      : this.isGigaCat ? 110
      : (this.turboActive ? 120 : 160);

    if (up) {
      const rad = Phaser.Math.DegToRad(this.player.angle - 90);
      this.player.body.velocity.x += Math.cos(rad) * ACCEL * (delta/1000);
      this.player.body.velocity.y += Math.sin(rad) * ACCEL * (delta/1000);
    }
    if (down) {
      const rad = Phaser.Math.DegToRad(this.player.angle - 90);
      this.player.body.velocity.x -= Math.cos(rad) * ACCEL * 0.5 * (delta/1000);
      this.player.body.velocity.y -= Math.sin(rad) * ACCEL * 0.5 * (delta/1000);
    }
    if (left)  this.player.angle -= TURN * (delta/1000);
    if (right) this.player.angle += TURN * (delta/1000);

    // Clamp speed
    const speed = Math.hypot(this.player.body.velocity.x, this.player.body.velocity.y);
    if (speed > maxSpeed) {
      const factor = maxSpeed / speed;
      this.player.body.velocity.x *= factor;
      this.player.body.velocity.y *= factor;
    }

    // Tint pulse
    if (this.isGigaCat) {
      const pulse = Math.sin(this.time.now * 0.005) > 0;
      this.player.setTint(pulse ? 0xFF9900 : 0xFFDD44);
    } else if (this.isTank) {
      const pulse = Math.sin(this.time.now * 0.006) > 0;
      this.player.setTint(pulse ? 0x88BB33 : 0xAADD55);
    } else if (this.isGigarocket) {
      const pulse = Math.sin(this.time.now * 0.008) > 0;
      this.player.setTint(pulse ? 0xFF2200 : 0xFF7700);
    } else if (this.isJet) {
      const pulse = Math.sin(this.time.now * 0.012) > 0;
      this.player.setTint(pulse ? 0xFF6600 : 0xFFAA44);
    } else if (this.turboActive) {
      const pulse = Math.sin(this.time.now * 0.025) > 0;
      this.player.setTint(pulse ? 0x00FFFF : 0xFFFFFF);
    } else {
      this.player.clearTint();
    }

    // Engine audio
    const audioSpeed = (this.isJet || this.turboActive || this.isGigarocket || this.isTank || this.isGigaCat) ? 1.0 : speed / PLAYER_MAX_SPEED;
    this.audio.setSpeed(audioSpeed);

    // Speed HUD
    const kmh = Math.round(speed * 0.5);
    this.speedText.setText(kmh + ' km/h' + (this.isGigaCat ? ' 🐱' : this.isTank ? ' 🪖' : this.isGigarocket ? ' 🚀' : this.isJet ? ' ✈' : this.turboActive ? ' ⚡' : ''));

    // Bar HUD
    this.updateTurboBar();
  }

  updateTurboBar() {
    const BAR_W = 120;
    if (this.isGigaCat || this.gigaCatPouncing) {
      if (this.gigaCatPouncing) {
        const frac = this.gigaCatPounceTimer / GIGACAT_POUNCE_DURATION;
        this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0xFF8C00);
        this.turboBarLabel.setText('MID-AIR!').setColor('#FFDD44');
      } else if (this.gigaCatPounceCooldown > 0) {
        const frac = 1 - (this.gigaCatPounceCooldown / GIGACAT_POUNCE_COOLDOWN);
        this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0xFF9933);
        const secs = Math.ceil(this.gigaCatPounceCooldown / 1000);
        this.turboBarLabel.setText(`${secs}s`).setColor('#FF9933');
      } else {
        this.turboBarFill.setSize(BAR_W, 10).setFillStyle(0xFF8C00);
        this.turboBarLabel.setText('POUNCE!').setColor('#FFCC44');
      }
      return;
    }
    if (this.isTank) {
      if (this.tankShellCooldown > 0) {
        const frac = 1 - (this.tankShellCooldown / TANK_SHELL_COOLDOWN);
        this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0x88AA22);
        this.turboBarLabel.setText('RELOAD').setColor('#AACC44');
      } else {
        this.turboBarFill.setSize(BAR_W, 10).setFillStyle(0xAADD44);
        this.turboBarLabel.setText('FIRE!').setColor('#CCFF66');
      }
      return;
    }
    if (this.isGigarocket || this.gigarocketCharging) {
      // Charge countdown bar
      if (this.gigarocketCharging) {
        const frac = this.gigarocketChargeTimer / GIGAROCKET_CHARGE_DURATION;
        this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0xFF2200);
        this.turboBarLabel.setText('BURNING!').setColor('#FF4422');
      } else {
        this.turboBarFill.setSize(BAR_W, 10).setFillStyle(0xFF4400);
        this.turboBarLabel.setText('ARMED!').setColor('#FF4400');
      }
      return;
    }
    if (this.isJet) {
      // Missile reload bar
      if (this.missileCooldown > 0) {
        const frac = 1 - (this.missileCooldown / MISSILE_COOLDOWN);
        this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0xFF3300);
        this.turboBarLabel.setText('RELOAD...').setColor('#FF3300');
      } else {
        this.turboBarFill.setSize(BAR_W, 10).setFillStyle(0xFF6600);
        this.turboBarLabel.setText('FIRE!').setColor('#FF6600');
      }
      return;
    }
    // Car mode: turbo bar
    if (this.turboActive) {
      const frac = this.turboTimer / TURBO_DURATION;
      this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0x00FFFF);
      this.turboBarLabel.setText('TURBO!').setColor('#00FFFF');
    } else if (this.turboCooldownTimer > 0) {
      const frac = 1 - (this.turboCooldownTimer / TURBO_COOLDOWN);
      this.turboBarFill.setSize(BAR_W * frac, 10).setFillStyle(0xFF6600);
      const secs = Math.ceil(this.turboCooldownTimer / 1000);
      this.turboBarLabel.setText(`${secs}s`).setColor('#FF6600');
    } else {
      this.turboBarFill.setSize(BAR_W, 10).setFillStyle(0x00FF88);
      this.turboBarLabel.setText('READY').setColor('#00FF88');
    }
  }

  activatePrimaryAbility() {
    if (this.preRace || this.gigarocketCharging || this.gigaCatPouncing) return false;

    if (this.isJet) {
      this.fireMissile();
      return true;
    }
    if (this.isGigarocket) {
      this.launchGigarocket();
      return true;
    }
    if (this.isTank) {
      this.fireTankShell();
      return true;
    }
    if (this.isGigaCat) {
      this.pounceCat();
      return true;
    }
    if (!this.turboActive && this.turboCooldownTimer <= 0) {
      this.turboActive = true;
      this.turboTimer = TURBO_DURATION;
      this.flashScreen(0x00FFFF);
      this.showComboText('TURBO!');
      this.audio.playTurbo && this.audio.playTurbo();
      return true;
    }
    return false;
  }

  debugAccelerateForward(boost = 1) {
    if (this.preRace) return this.getDebugState();
    const rad = Phaser.Math.DegToRad(this.player.angle - 90);
    const impulse = PLAYER_MAX_SPEED * Math.max(0.25, boost);
    this.player.body.velocity.x += Math.cos(rad) * impulse;
    this.player.body.velocity.y += Math.sin(rad) * impulse;
    return this.getDebugState();
  }

  debugSetMode(mode) {
    const allowedModes = ['car', 'jet', 'gigarocket', 'tank', 'gigacat'];
    if (!allowedModes.includes(mode)) return this.getDebugState();

    let guard = 0;
    while (this.getModeName() !== mode && guard < allowedModes.length + 1) {
      this.transformToggle();
      guard++;
    }
    return this.getDebugState();
  }

  // ── Transform: cycle Car → Jet → Gigarocket → Car ──
  transformToggle() {
    // Can't transform while charging/pouncing
    if (this.gigarocketCharging || this.gigaCatPouncing) return;

    this.audio.playTransform && this.audio.playTransform();

    if (!this.isJet && !this.isGigarocket && !this.isTank && !this.isGigaCat) {
      // ── Car → Jet ──
      this.isJet = true;
      this.turboActive = false;
      this.player.setTexture('jet');
      this.player.body.setSize(32, 40);
      this.player.body.setMaxVelocity(JET_SPEED, JET_SPEED);
      this.modeText.setText('✈ JET  [T=GIGA | SPACE=FIRE]').setColor('#FF9900');
      this.turboBarTitle.setText('MISSILE').setColor('#FF8844');
      this.showComboText('✈ JET MODE!');
      this.flashScreen(0xFF6600);

    } else if (this.isJet) {
      // ── Jet → Gigarocket ──
      this.isJet = false;
      this.isGigarocket = true;
      this.reticleSprite.setAlpha(0);
      this.targetedCar = null;
      this.player.setTexture('gigarocket');
      this.player.body.setSize(54, 88);
      this.player.body.setMaxVelocity(GIGAROCKET_SPEED, GIGAROCKET_SPEED);
      this.player.body.setVelocity(0, 0);
      this.modeText.setText('🚀 GIGA  [T=TANK | SPACE=LAUNCH!]').setColor('#FF3300');
      this.turboBarTitle.setText('LAUNCH').setColor('#FF4422');
      this.showComboText('🚀 GIGAROCKET ARMED!');
      this.flashScreen(0xFF2200);
      this.audio.playHit && this.audio.playHit(true);

    } else if (this.isGigarocket) {
      // ── Gigarocket → Tank ──
      this.isGigarocket = false;
      this._stopGigarocketTrail();
      this.isTank = true;
      this.player.setTexture('tank');
      this.player.body.setSize(40, 34);
      this.player.body.setMaxVelocity(TANK_SPEED, TANK_SPEED);
      this.player.body.setVelocity(0, 0);
      this.modeText.setText('🪖 TANK  [T=CAT | SPACE=FIRE]').setColor('#AACC44');
      this.turboBarTitle.setText('SHELL').setColor('#AACC44');
      this.showComboText('🪖 TANK MODE!');
      this.flashScreen(0x88AA22);
      this.cameras.main.shake(200, 0.01);

    } else if (this.isTank) {
      // ── Tank → GigaCat ──
      this.isTank = false;
      this.tankShellCooldown = 0;
      this.isGigaCat = true;
      this.gigaCatPouncing = false;
      this.gigaCatPounceCooldown = 0;
      this.player.setTexture('gigacat');
      this.player.setScale(1);
      this.player.body.setSize(48, 52);
      this.player.body.setMaxVelocity(GIGACAT_SPEED, GIGACAT_SPEED);
      this.player.body.setVelocity(0, 0);
      this.modeText.setText('🐱 GIGACAT  [T=CAR | SPACE=POUNCE]').setColor('#FFAA33');
      this.turboBarTitle.setText('POUNCE').setColor('#FFAA33');
      this.showComboText('😾 GIGACAT UNLEASHED!');
      this.flashScreen(0xFF8C00);
      this.audio.playCatPounce && this.audio.playCatPounce();

    } else {
      // ── GigaCat (or any leftover) → Car ──
      this.isGigaCat = false;
      this.gigaCatPouncing = false;
      this.player.setScale(1);
      this.player.setTexture('player_car');
      this.player.body.setSize(14, 28);
      this.player.body.setMaxVelocity(PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
      this.player.body.setVelocity(0, 0);
      this.modeText.setText('🚗 CAR  [T=TRANSFORM | SPC=TURBO]').setColor('#AAFFAA');
      this.turboBarTitle.setText('TURBO').setColor('#AAAAAA');
      this.showComboText('🚗 CAR MODE');
      this.flashScreen(0x00FF88);
    }
  }

  _stopGigarocketTrail() {
    if (this.gigarocketTrailEmitter) {
      this.gigarocketTrailEmitter.stop();
      this.gigarocketTrailEmitter.destroy();
      this.gigarocketTrailEmitter = null;
    }
  }

  destroyProjectile(projectile) {
    if (!projectile || !projectile.active) return;
    if (projectile.body) {
      projectile.body.setVelocity(0, 0);
      projectile.body.enable = false;
    }
    projectile.destroy();
  }

  // ── Launch the gigarocket charge ──
  launchGigarocket() {
    if (this.gigarocketCharging) return;
    this.gigarocketCharging = true;
    this.gigarocketChargeTimer = GIGAROCKET_CHARGE_DURATION;

    this.player.body.setMaxVelocity(GIGAROCKET_CHARGE_SPEED + 100, GIGAROCKET_CHARGE_SPEED + 100);
    this.showComboText('🚀 GIGA LAUNCH!!!');
    this.flashScreen(0xFF1100);
    this.cameras.main.shake(400, 0.025);
    this.audio.playExplosion && this.audio.playExplosion();

    // Big burst at launch position
    this.createExplosion(this.player.x, this.player.y);

    // Continuous flame trail emitter
    this._stopGigarocketTrail();
    this.gigarocketTrailEmitter = this.add.particles(
      this.player.x, this.player.y, 'gigarocket_flame', {
        speed: { min: 40, max: 120 },
        scale: { start: 2.5, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 500,
        frequency: 30,
        angle: { min: 0, max: 360 },
        blendMode: 'ADD',
        tint: [0xFF9900, 0xFF4400, 0xFFFF00],
      }
    ).setDepth(16);
  }

  // ── GigaCat pounce launch ──
  pounceCat() {
    if (this.gigaCatPouncing || this.gigaCatPounceCooldown > 0) return;

    this.gigaCatPouncing = true;
    this.gigaCatPounceTimer = GIGACAT_POUNCE_DURATION;
    this.gigaCatPounceCooldown = GIGACAT_POUNCE_COOLDOWN;

    // Angry yowl
    this.audio.playCatPounce && this.audio.playCatPounce();

    // Launch velocity
    const rad = Phaser.Math.DegToRad(this.player.angle - 90);
    this.player.body.setMaxVelocity(GIGACAT_POUNCE_SPEED + 50, GIGACAT_POUNCE_SPEED + 50);
    this.player.body.velocity.x = Math.cos(rad) * GIGACAT_POUNCE_SPEED;
    this.player.body.velocity.y = Math.sin(rad) * GIGACAT_POUNCE_SPEED;

    this.flashScreen(0xFF8C00);
    const catPhrases = ['😾 POUNCE!', '🐱 RAAWR!', '😾 GOT YOU!', '🐾 STOMP!'];
    this.showComboText(catPhrases[Phaser.Math.Between(0, catPhrases.length - 1)]);
  }

  // ── GigaCat lands — AOE kill in radius ──
  gigaCatLand() {
    this.gigaCatPouncing = false;
    this.player.setScale(1);
    this.player.body.setMaxVelocity(GIGACAT_SPEED, GIGACAT_SPEED);
    this.player.body.setVelocity(0, 0);

    // Sound
    this.audio.playCatLand && this.audio.playCatLand();

    // Camera shake
    this.cameras.main.shake(350, 0.025);

    // Expanding paw-print shockwave
    const paw = this.add.image(this.player.x, this.player.y, 'gigacat_paw')
      .setDepth(12).setAlpha(0.85).setScale(1);
    this.tweens.add({
      targets: paw,
      scaleX: (GIGACAT_POUNCE_RADIUS * 2) / 64,
      scaleY: (GIGACAT_POUNCE_RADIUS * 2) / 64,
      alpha: 0,
      duration: 700,
      ease: 'Quad.Out',
      onComplete: () => paw.destroy(),
    });

    // Secondary explosion burst at landing
    this.createExplosion(this.player.x, this.player.y);

    // Kill every car within pounce radius
    let stomped = 0;
    this.f1Cars.forEach(car => {
      if (car.dead) return;
      const dist = Math.hypot(car.sprite.x - this.player.x, car.sprite.y - this.player.y);
      if (dist <= GIGACAT_POUNCE_RADIUS) {
        // Extra explosion at each victim
        this.createExplosion(car.sprite.x, car.sprite.y);
        car.hp = 0; car.state = 3;
        this.destroyCar(car, true);
        stomped++;
      }
    });

    if (stomped > 1) this.showComboText(`😾 MULTI-STOMP ×${stomped}!`);
    else if (stomped === 0) this.showCommentator('The cat pounced… and missed. Graceful.');
  }

  // ── Fire tank shell straight ahead ──
  fireTankShell() {
    if (this.tankShellCooldown > 0) return;
    this.tankShellCooldown = TANK_SHELL_COOLDOWN;
    this.audio.playTankShot && this.audio.playTankShot();

    const rad = Phaser.Math.DegToRad(this.player.angle - 90);

    // Spawn shell at barrel tip (ahead of tank)
    const barrelOffsetX = Math.cos(rad) * 32;
    const barrelOffsetY = Math.sin(rad) * 32;
    const shell = this.tankShellGroup.create(
      this.player.x + barrelOffsetX,
      this.player.y + barrelOffsetY,
      'tank_shell'
    );
    shell.setDepth(19);
    shell.body.setAllowGravity(false);
    shell.body.setMaxVelocity(TANK_SHELL_SPEED + 50, TANK_SHELL_SPEED + 50);
    shell.body.setVelocity(Math.cos(rad) * TANK_SHELL_SPEED, Math.sin(rad) * TANK_SHELL_SPEED);
    shell.setAngle(this.player.angle);
    shell._birthTime = this.time.now;

    // Recoil push-back
    this.player.body.velocity.x -= Math.cos(rad) * 280;
    this.player.body.velocity.y -= Math.sin(rad) * 280;

    // Muzzle flash + screen shake
    this.flashScreen(0xFF9900);
    this.cameras.main.shake(80, 0.01);

    // Muzzle smoke burst at barrel tip
    const muzzle = this.add.particles(
      this.player.x + barrelOffsetX,
      this.player.y + barrelOffsetY,
      'smoke', {
        speed: { min: 60, max: 160 },
        scale: { start: 1.0, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 400,
        quantity: 6,
        stopAfter: 6,
        tint: 0x888888,
      }
    ).setDepth(20);
    this.time.delayedCall(600, () => muzzle.destroy());
  }

  // ── Tank shell → car hit ──
  handleTankShellHit(shell, carSprite) {
    if (!shell.active) return;
    const car = carSprite._carData;
    if (!car || car.dead) {
      this.destroyProjectile(shell);
      return;
    }

    this.createExplosion(shell.x, shell.y);
    this.destroyProjectile(shell);

    // Instant kill
    car.hp = 0; car.state = 3;
    this.destroyCar(car, true);
  }

  // ── Update tank shells (cooldown + TTL) ──
  updateTankShells(delta) {
    this.tankShellCooldown = Math.max(0, this.tankShellCooldown - delta);
    const now = this.time.now;
    this.tankShellGroup.getChildren().slice().forEach(s => {
      if (s.active && now - s._birthTime > 4000) {
        this.destroyProjectile(s);
      }
    });
  }

  // ── Find nearest living F1 car within MISSILE_RANGE ──
  findNearestCar() {
    let nearest = null;
    let nearestDist = MISSILE_RANGE;
    this.f1Cars.forEach(car => {
      if (car.dead) return;
      const dist = Math.hypot(car.sprite.x - this.player.x, car.sprite.y - this.player.y);
      if (dist < nearestDist) { nearestDist = dist; nearest = car; }
    });
    return nearest;
  }

  // ── Fire missile toward targeted car ──
  fireMissile() {
    if (this.missileCooldown > 0) return;
    this.targetedCar = this.findNearestCar();
    if (!this.targetedCar || this.targetedCar.dead) {
      // No target in range — flash red
      this.flashScreen(0xFF0000);
      return;
    }
    this.missileCooldown = MISSILE_COOLDOWN;
    this.audio.playMissile && this.audio.playMissile();

    const dx = this.targetedCar.sprite.x - this.player.x;
    const dy = this.targetedCar.sprite.y - this.player.y;
    const angle = Math.atan2(dy, dx);

    // Create missile directly inside the physics group — avoids body reset on .add()
    const m = this.missileGroup.create(this.player.x, this.player.y, 'missile');
    m.setDepth(18);
    m.body.setAllowGravity(false);
    m.body.setMaxVelocity(MISSILE_SPEED + 50, MISSILE_SPEED + 50);
    m.body.setVelocity(Math.cos(angle) * MISSILE_SPEED, Math.sin(angle) * MISSILE_SPEED);
    m.setAngle(Phaser.Math.RadToDeg(angle) + 90);
    m._birthTime = this.time.now;

    // Small muzzle flash
    this.flashScreen(0xFF4400);
  }

  // ── Missile → car overlap handler ──
  handleMissileHit(missile, carSprite) {
    if (!missile.active) return;
    const car = carSprite._carData;
    if (!car || car.dead) {
      this.destroyProjectile(missile);
      return;
    }

    this.createExplosion(missile.x, missile.y);
    this.destroyProjectile(missile);

    // Instant kill
    car.hp = 0;
    car.state = 3;
    this.destroyCar(car, true);
  }

  // ── Update targeting reticle ──
  updateReticle() {
    if (!this.isJet || this.isGigarocket || this.gigarocketCharging || this.isTank) {
      this.reticleSprite.setAlpha(0);
      return;
    }
    this.targetedCar = this.findNearestCar();
    if (!this.targetedCar) {
      this.reticleSprite.setAlpha(0);
      return;
    }
    // Pulse alpha and scale
    const t = this.time.now;
    const pulse = 0.7 + Math.sin(t * 0.008) * 0.3;
    const scalePulse = 1.0 + Math.sin(t * 0.006) * 0.12;
    this.reticleSprite
      .setPosition(this.targetedCar.sprite.x, this.targetedCar.sprite.y)
      .setAlpha(pulse)
      .setScale(scalePulse)
      .setTint(this.missileCooldown > 0 ? 0xFF6600 : 0xFF0000);
  }

  // ── Update missiles (tick cooldown + TTL cleanup) ──
  updateMissiles(delta) {
    this.missileCooldown = Math.max(0, this.missileCooldown - delta);
    const now = this.time.now;
    this.missileGroup.getChildren().slice().forEach(m => {
      if (m.active && now - m._birthTime > 3000) {
        this.destroyProjectile(m);
      }
    });
  }

  // ── Update ──
  update(time, delta) {
    this.updatePlayer(delta);
    this.updateAI(delta);
    this.updateMinimap();
    this.updateHUD();
    this.updateDebugOverlay();
    this.updateReticle();
    this.updateMissiles(delta);
    this.updateTankShells(delta);
  }
}
