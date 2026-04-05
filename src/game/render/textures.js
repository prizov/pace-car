import { WAYPOINTS } from '../data/content.js';

// ── Asset generation helpers ────────────────────────────────
export function makeCarTexture(scene, key, bodyColor, accentColor, isPlayer=false) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const W = 18, H = 34;
  // Shadow
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(W/2+2, H/2+3, W-2, H-8);
  // Body
  g.fillStyle(bodyColor, 1);
  g.fillRoundedRect(2, 4, W-4, H-8, 4);
  // Accent stripe
  g.fillStyle(accentColor, 1);
  g.fillRect(5, 10, W-10, 4);
  // Cockpit
  g.fillStyle(0x111133, 1);
  g.fillEllipse(W/2, H/2-2, 7, 10);
  // Front wing
  g.fillStyle(accentColor, 1);
  g.fillRect(1, 4, W-2, 3);
  // Rear wing
  g.fillRect(1, H-9, W-2, 3);
  if (isPlayer) {
    // Light bar (yellow)
    g.fillStyle(0xFFEE00, 1);
    g.fillRect(4, 2, W-8, 3);
    // Red body
    g.fillStyle(0xCC0000, 1);
    g.fillRoundedRect(2, 4, W-4, H-8, 4);
    // Silver accents
    g.fillStyle(0xC0C0C0, 1);
    g.fillRect(5, 10, W-10, 3);
    g.fillRect(5, H-14, W-10, 3);
    // Light bar again on top
    g.fillStyle(0xFFEE00, 1);
    g.fillRect(4, 2, W-8, 3);
  }
  g.generateTexture(key, W, H);
  g.destroy();
}

export function makeSmokeTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  g.fillStyle(0x444444, 0.6);
  g.fillCircle(8, 8, 8);
  g.generateTexture('smoke', 16, 16);
  g.destroy();
}

export function makeExplosionTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  g.fillStyle(0xFF6600, 1);
  g.fillCircle(12, 12, 12);
  g.fillStyle(0xFFCC00, 1);
  g.fillCircle(12, 12, 7);
  g.generateTexture('explosion', 24, 24);
  g.destroy();
}

export function makeWreckTexture(scene, key, bodyColor) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const W = 18, H = 34;
  g.fillStyle(0x222222, 1);
  g.fillRoundedRect(2, 4, W-4, H-8, 4);
  g.fillStyle(bodyColor, 0.4);
  g.fillRect(4, 8, W-8, H-16);
  g.fillStyle(0x111111, 1);
  g.fillRect(3, 6, 5, 4);
  g.fillRect(W-8, H-12, 5, 4);
  g.generateTexture(key+'_wreck', W, H);
  g.destroy();
}

export function makeJetTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const JW = 44, JH = 52;
  // Shadow
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(JW/2 + 2, JH/2 + 4, JW - 4, JH - 10);
  // Main fuselage (dark steel)
  g.fillStyle(0x556677, 1);
  g.fillRoundedRect(JW/2 - 6, 6, 12, JH - 12, 4);
  // Swept wings
  g.fillStyle(0x445566, 1);
  g.fillTriangle(JW/2 - 6, JH/2 - 4, 2, JH/2 + 12, JW/2 - 6, JH/2 + 14);
  g.fillTriangle(JW/2 + 6, JH/2 - 4, JW - 2, JH/2 + 12, JW/2 + 6, JH/2 + 14);
  // Tail fins
  g.fillStyle(0x556677, 1);
  g.fillTriangle(JW/2 - 6, JH - 14, 8, JH - 7, JW/2 - 6, JH - 7);
  g.fillTriangle(JW/2 + 6, JH - 14, JW - 8, JH - 7, JW/2 + 6, JH - 7);
  // Nose cone
  g.fillStyle(0x778899, 1);
  g.fillTriangle(JW/2 - 4, 8, JW/2 + 4, 8, JW/2, 2);
  // Cockpit canopy (blue tint)
  g.fillStyle(0x3399FF, 0.9);
  g.fillEllipse(JW/2, JH/2 - 5, 9, 14);
  // Under-wing missiles
  g.fillStyle(0xCCCCCC, 1);
  g.fillRect(JW/2 - 15, JH/2 + 2, 5, 10);
  g.fillRect(JW/2 + 10, JH/2 + 2, 5, 10);
  g.fillStyle(0xFF4400, 1);
  g.fillRect(JW/2 - 15, JH/2 + 2, 5, 2);
  g.fillRect(JW/2 + 10, JH/2 + 2, 5, 2);
  // Afterburner
  g.fillStyle(0xFF6600, 1);
  g.fillRect(JW/2 - 4, JH - 9, 8, 6);
  g.fillStyle(0xFFFF00, 0.9);
  g.fillRect(JW/2 - 2, JH - 7, 4, 4);
  // Wing-tip nav lights
  g.fillStyle(0xFF0000, 1); g.fillCircle(3, JH/2 + 12, 2);
  g.fillStyle(0x00FF00, 1); g.fillCircle(JW - 3, JH/2 + 12, 2);
  g.generateTexture('jet', JW, JH);
  g.destroy();
}

export function makeMissileTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  // Elongated missile, nose at top (y=0), rendered facing up; rotated at launch
  g.fillStyle(0xDDDDDD, 1);
  g.fillRoundedRect(1, 2, 4, 10, 2); // body
  g.fillStyle(0xFF4400, 1);
  g.fillTriangle(1, 3, 5, 3, 3, 0);  // nose tip
  g.fillStyle(0xFF9900, 1);
  g.fillRect(2, 12, 2, 4);            // exhaust
  g.generateTexture('missile', 6, 16);
  g.destroy();
}

export function makeReticleTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const R = 28, S = 60;
  // Circle
  g.lineStyle(2, 0xFF3300, 1);
  g.strokeCircle(S/2, S/2, R);
  // Cross-hair gaps
  g.lineStyle(1, 0xFF3300, 0.85);
  const cx = S/2, cy = S/2;
  g.lineBetween(cx - R - 8, cy, cx - R + 6, cy);
  g.lineBetween(cx + R - 6, cy, cx + R + 8, cy);
  g.lineBetween(cx, cy - R - 8, cx, cy - R + 6);
  g.lineBetween(cx, cy + R - 6, cx, cy + R + 8);
  g.generateTexture('reticle', S, S);
  g.destroy();
}

export function makeGigarocketTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const RW = 86, RH = 130;
  // Shadow
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(RW/2 + 4, RH/2 + 8, RW - 8, RH - 20);
  // Body gradient — layered rects for shading
  g.fillStyle(0xFF3300, 1);
  g.fillRoundedRect(RW/2 - 18, 10, 36, RH - 30, 8);
  g.fillStyle(0xFF5522, 1);
  g.fillRoundedRect(RW/2 - 13, 12, 26, RH - 34, 6);
  // Nose cone
  g.fillStyle(0xFF1100, 1);
  g.fillTriangle(RW/2 - 18, 14, RW/2 + 18, 14, RW/2, 0);
  g.fillStyle(0xFF6644, 1);
  g.fillTriangle(RW/2 - 8, 14, RW/2 + 8, 14, RW/2, 5);
  // Black warning bands
  g.fillStyle(0x111111, 0.75);
  g.fillRect(RW/2 - 18, 38, 36, 8);
  g.fillRect(RW/2 - 18, 66, 36, 8);
  // Yellow hazard stripes on bands
  g.fillStyle(0xFFDD00, 1);
  g.fillRect(RW/2 - 18, 40, 9, 6);
  g.fillRect(RW/2 - 18 + 18, 40, 9, 6);
  g.fillRect(RW/2 - 18, 68, 9, 6);
  g.fillRect(RW/2 - 18 + 18, 68, 9, 6);
  // ☢ symbol (red outer + yellow inner + red dot)
  g.fillStyle(0xFF0000, 0.9); g.fillCircle(RW/2, 88, 10);
  g.fillStyle(0xFFDD00, 1);   g.fillCircle(RW/2, 88, 6);
  g.fillStyle(0xFF0000, 1);   g.fillCircle(RW/2, 88, 3);
  g.fillStyle(0xFFDD00, 1);   g.fillCircle(RW/2, 88, 1);
  // Large swept stabiliser fins
  g.fillStyle(0xCC2200, 1);
  g.fillTriangle(RW/2 - 18, RH - 30, 3, RH - 6, RW/2 - 18, RH - 6);
  g.fillTriangle(RW/2 + 18, RH - 30, RW - 3, RH - 6, RW/2 + 18, RH - 6);
  // Fin detail lines
  g.lineStyle(1, 0xFF6622, 0.6);
  g.lineBetween(RW/2 - 18, RH - 30, 3, RH - 6);
  g.lineBetween(RW/2 + 18, RH - 30, RW - 3, RH - 6);
  // Rear body closure
  g.fillStyle(0xFF3300, 1);
  g.fillRect(RW/2 - 18, RH - 32, 36, 12);
  // Nozzle
  g.fillStyle(0x333333, 1);
  g.fillRect(RW/2 - 12, RH - 22, 24, 10);
  g.fillStyle(0xFF9900, 1);
  g.fillRect(RW/2 - 8, RH - 14, 16, 6);
  g.fillStyle(0xFFFF00, 0.95);
  g.fillRect(RW/2 - 4, RH - 10, 8, 5);
  g.generateTexture('gigarocket', RW, RH);
  g.destroy();
}

export function makeTankTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const TW = 54, TH = 48;
  // Shadow
  g.fillStyle(0x000000, 0.28);
  g.fillEllipse(TW/2 + 2, TH/2 + 4, TW - 6, TH - 12);
  // Left track (rubber tread)
  g.fillStyle(0x1E1E1E, 1);
  g.fillRoundedRect(1, 7, 11, TH - 14, 3);
  g.fillStyle(0x333333, 1);
  for (let wy = 11; wy < TH - 12; wy += 8) g.fillRect(2, wy, 9, 4);
  // Right track
  g.fillStyle(0x1E1E1E, 1);
  g.fillRoundedRect(TW - 12, 7, 11, TH - 14, 3);
  g.fillStyle(0x333333, 1);
  for (let wy = 11; wy < TH - 12; wy += 8) g.fillRect(TW - 11, wy, 9, 4);
  // Track guard plates
  g.fillStyle(0x4A5E2A, 1);
  g.fillRect(11, 5, 4, TH - 10);
  g.fillRect(TW - 15, 5, 4, TH - 10);
  // Hull (olive / army green)
  g.fillStyle(0x4A5E2A, 1);
  g.fillRoundedRect(15, 5, TW - 30, TH - 10, 4);
  g.fillStyle(0x5C7234, 0.5);
  g.fillRoundedRect(17, 7, TW - 34, 10, 3); // highlight ridge
  // Hull bolts
  g.fillStyle(0x2A3A18, 1);
  [[18,9],[TW-19,9],[18,TH-10],[TW-19,TH-10]].forEach(([bx,by]) => g.fillCircle(bx, by, 2));
  // Turret ring
  g.fillStyle(0x38501A, 1); g.fillCircle(TW/2, TH/2 + 2, 14);
  g.fillStyle(0x4A5E2A, 1); g.fillCircle(TW/2, TH/2 + 2, 11);
  g.fillStyle(0x5A6E38, 0.4); g.fillCircle(TW/2 - 3, TH/2 - 1, 5); // glint
  // Gun barrel (points UP = forward direction, angle=0 is north)
  g.fillStyle(0x2A3A18, 1);
  g.fillRect(TW/2 - 3, 0, 6, TH/2 - 2);
  g.fillStyle(0x3A4A28, 1);
  g.fillRect(TW/2 - 2, 1, 4, TH/2 - 4);
  // Muzzle brake
  g.fillStyle(0x1A2810, 1);
  g.fillRect(TW/2 - 4, 0, 8, 5);
  g.fillStyle(0x2A3A18, 1);
  g.fillRect(TW/2 - 3, 1, 6, 4);
  // Commander's cupola
  g.fillStyle(0x38501A, 1); g.fillCircle(TW/2, TH/2 + 2, 4);
  g.fillStyle(0x1A2810, 1); g.fillCircle(TW/2, TH/2 + 2, 2);
  g.generateTexture('tank', TW, TH);
  g.destroy();
}

export function makeTankShellTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  // Shell: 8×16, nose at top (angle=0 → north)
  g.fillStyle(0x996622, 1);
  g.fillRoundedRect(1, 4, 6, 11, 2);  // body
  g.fillStyle(0xCC9944, 1);
  g.fillTriangle(1, 5, 7, 5, 4, 0);   // pointed nose
  g.fillStyle(0x775511, 1);
  g.fillRect(2, 14, 4, 3);             // brass casing
  g.fillStyle(0xFFDD88, 0.6);
  g.fillRect(2, 4, 2, 8);             // shine
  g.generateTexture('tank_shell', 8, 16);
  g.destroy();
}

export function makeGigaCatTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const CW = 70, CH = 74;
  // Shadow
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(CW/2 + 2, CH/2 + 6, CW - 8, CH - 18);
  // Body (ginger orange)
  g.fillStyle(0xFF8C00, 1);
  g.fillEllipse(CW/2, CH/2 + 6, CW - 12, CH - 22);
  // Body stripes (tabby)
  g.fillStyle(0xCC6600, 0.65);
  g.fillRect(CW/2 - 14, CH/2 + 2,  28, 5);
  g.fillRect(CW/2 - 11, CH/2 + 12, 22, 5);
  g.fillRect(CW/2 - 10, CH/2 - 8,  20, 4);
  // Belly (lighter)
  g.fillStyle(0xFFCC88, 0.5);
  g.fillEllipse(CW/2, CH/2 + 8, 18, 26);
  // Back paws
  g.fillStyle(0xFF9922, 1);
  g.fillEllipse(CW/2 - 18, CH - 15, 14, 11);
  g.fillEllipse(CW/2 + 18, CH - 15, 14, 11);
  g.fillStyle(0xFFAA44, 1);
  g.fillEllipse(CW/2 - 18, CH - 14, 10, 8);
  g.fillEllipse(CW/2 + 18, CH - 14, 10, 8);
  // Tail (curled, bottom-right)
  g.lineStyle(9, 0xFF8C00, 1);
  g.strokeCircle(CW - 12, CH - 12, 8);
  g.lineStyle(6, 0xFFAA33, 1);
  g.strokeCircle(CW - 12, CH - 12, 6);
  g.fillStyle(0xFF8C00, 1); g.fillCircle(CW - 12, CH - 4, 5);
  // Head (front = top, drawn as slightly larger circle)
  g.fillStyle(0xFF9922, 1);
  g.fillCircle(CW/2, 19, 20);
  g.fillStyle(0xFFAA44, 0.4);
  g.fillCircle(CW/2 - 4, 15, 9); // sheen
  // Ears
  g.fillStyle(0xFF8C00, 1);
  g.fillTriangle(CW/2 - 18, 16, CW/2 - 10, 2, CW/2 - 4, 16);
  g.fillTriangle(CW/2 + 18, 16, CW/2 + 10, 2, CW/2 + 4, 16);
  g.fillStyle(0xFF99BB, 1);
  g.fillTriangle(CW/2 - 16, 15, CW/2 - 11, 6, CW/2 - 6, 15);
  g.fillTriangle(CW/2 + 16, 15, CW/2 + 11, 6, CW/2 + 6, 15);
  // Eyes (big angry green)
  g.fillStyle(0x33DD55, 1);
  g.fillEllipse(CW/2 - 7, 19, 10, 11);
  g.fillEllipse(CW/2 + 7, 19, 10, 11);
  g.fillStyle(0x111111, 1);
  g.fillEllipse(CW/2 - 7, 19, 4, 10);
  g.fillEllipse(CW/2 + 7, 19, 4, 10);
  g.fillStyle(0xFFFFFF, 0.9);
  g.fillCircle(CW/2 - 5, 16, 2);
  g.fillCircle(CW/2 + 9, 16, 2);
  // Angry brow lines
  g.lineStyle(2, 0x884400, 0.8);
  g.lineBetween(CW/2 - 11, 11, CW/2 - 4, 14);
  g.lineBetween(CW/2 + 11, 11, CW/2 + 4, 14);
  // Nose + mouth
  g.fillStyle(0xFF88AA, 1);
  g.fillTriangle(CW/2 - 2, 25, CW/2 + 2, 25, CW/2, 28);
  g.lineStyle(1, 0x884400, 0.7);
  g.lineBetween(CW/2, 28, CW/2 - 4, 31);
  g.lineBetween(CW/2, 28, CW/2 + 4, 31);
  // Whiskers
  g.lineStyle(1, 0x333333, 0.55);
  g.lineBetween(CW/2 - 4, 26, CW/2 - 20, 24);
  g.lineBetween(CW/2 - 4, 27, CW/2 - 20, 29);
  g.lineBetween(CW/2 + 4, 26, CW/2 + 20, 24);
  g.lineBetween(CW/2 + 4, 27, CW/2 + 20, 29);
  // Red collar + bell
  g.fillStyle(0xDD2222, 1);
  g.fillRect(CW/2 - 12, 30, 24, 5);
  g.fillStyle(0xFFDD00, 1); g.fillCircle(CW/2, 37, 4);
  g.fillStyle(0xCCAA00, 1); g.fillCircle(CW/2, 37, 2);
  // Front paws (below collar)
  g.fillStyle(0xFF9922, 1);
  g.fillEllipse(CW/2 - 18, 36, 14, 11);
  g.fillEllipse(CW/2 + 18, 36, 14, 11);
  g.fillStyle(0xFFAA44, 1);
  g.fillEllipse(CW/2 - 18, 35, 10, 8);
  g.fillEllipse(CW/2 + 18, 35, 10, 8);
  // Claw lines
  g.lineStyle(1, 0xCC7700, 0.8);
  g.lineBetween(CW/2 - 22, 36, CW/2 - 14, 36);
  g.lineBetween(CW/2 + 14, 36, CW/2 + 22, 36);
  g.generateTexture('gigacat', CW, CH);
  g.destroy();
}

export function makeGigaCatPawTexture(scene) {
  // Paw print shockwave for stomp landing
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const S = 64;
  // Palm
  g.fillStyle(0xFF9933, 0.55);
  g.fillCircle(S/2, S/2 + 4, 18);
  // Toe beans (4 toes)
  g.fillStyle(0xFF9933, 0.65);
  g.fillCircle(S/2 - 14, S/2 - 10, 9);
  g.fillCircle(S/2 -  5, S/2 - 16, 9);
  g.fillCircle(S/2 +  5, S/2 - 16, 9);
  g.fillCircle(S/2 + 14, S/2 - 10, 9);
  // Inner pad
  g.fillStyle(0xFFAA55, 0.4);
  g.fillCircle(S/2, S/2 + 4, 12);
  g.generateTexture('gigacat_paw', S, S);
  g.destroy();
}

export function makeGigarocketFlameTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  g.fillStyle(0xFF9900, 1);   g.fillCircle(12, 12, 12);
  g.fillStyle(0xFF4400, 0.8); g.fillCircle(12, 12, 8);
  g.fillStyle(0xFFFF00, 0.9); g.fillCircle(12, 12, 5);
  g.generateTexture('gigarocket_flame', 24, 24);
  g.destroy();
}

export function makeTrackTexture(scene) {
  // Draw entire Silverstone layout into a large texture
  const TW = 4000, TH = 3000;
  const g = scene.make.graphics({ x:0, y:0, add:false });

  // Green countryside background
  g.fillStyle(0x3A7D44, 1);
  g.fillRect(0, 0, TW, TH);

  // Draw track surface (wide path following waypoints)
  const pts = WAYPOINTS;
  // Track base (asphalt) — draw thick lines between waypoints
  const TRACK_WIDTH = 120;
  g.lineStyle(TRACK_WIDTH, 0x333333, 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.strokePath();

  // White racing line (centre)
  g.lineStyle(4, 0xFFFFFF, 0.4);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.strokePath();

  // Red/white kerbs on inside — draw small boxes at corners (low speedFactor)
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].s < 0.7) {
      const angle = Math.atan2(
        pts[(i+1)%pts.length].y - pts[i].y,
        pts[(i+1)%pts.length].x - pts[i].x
      );
      const inX = pts[i].x + Math.sin(angle) * (TRACK_WIDTH/2 - 10);
      const inY = pts[i].y - Math.cos(angle) * (TRACK_WIDTH/2 - 10);
      // Alternating red/white kerb dots
      const col = (i % 2 === 0) ? 0xFF0000 : 0xFFFFFF;
      g.fillStyle(col, 1);
      g.fillRect(inX - 8, inY - 8, 16, 6);
    }
  }

  // Start/finish line — vertical stripe across the horizontal S/F straight
  g.fillStyle(0xFFFFFF, 1);
  g.fillRect(1900, 218, TRACK_WIDTH / 2, 60);
  g.fillStyle(0x000000, 1);
  for (let i = 0; i < 6; i++) {
    g.fillRect(1900, 218 + i * 10, TRACK_WIDTH / 2, 5);
  }

  // Pit lane — parallel to S/F, slightly above (lower y)
  g.fillStyle(0x555555, 1);
  g.fillRect(1400, 196, 460, 26);
  g.lineStyle(2, 0xFFFF00, 1);
  g.strokeRect(1400, 196, 460, 26);

  // ── Spectator grandstands ──────────────────────────────────
  // Local helper: draw one grandstand section with crowd
  const CROWD = [
    0xFF8000,0xCC0000,0x1B3F8B,0xFFFF00,0xFF00AA,
    0xFFFFFF,0x007A33,0x005AFF,0xFF4400,0xEEEEEE,
    0x00594F,0xFF6622,0xAAAA00,0x00AAFF,0xFF2244,
  ];
  const drawStand = (sx, sy, sw, sh, roofColor = 0x334455) => {
    const PW = 6, PH = 8;
    // Concrete tiers background
    g.fillStyle(0xA0A0A8, 0.85);
    g.fillRect(sx, sy, sw, sh);
    // Tier step lines
    for (let ry = sy; ry < sy + sh; ry += PH) {
      g.fillStyle(0x888890, 0.5);
      g.fillRect(sx, ry, sw, 1);
    }
    // Spectators — random coloured blobs per seat
    for (let cy = sy + 2; cy < sy + sh - 1; cy += PH) {
      for (let cx = sx + 1; cx < sx + sw - 1; cx += PW) {
        const c = CROWD[Math.floor(Math.random() * CROWD.length)];
        g.fillStyle(c, 0.68 + Math.random() * 0.28);
        g.fillRect(cx, cy + 2, PW - 1, PH - 3);
        // Tiny head dot above body
        g.fillStyle(0xFFCCAA, 0.6);
        g.fillRect(cx + 1, cy, 3, 2);
      }
    }
    // Roof overhang
    g.fillStyle(roofColor, 1);
    g.fillRect(sx - 2, sy - 10, sw + 4, 11);
    g.fillStyle(0x222233, 0.6);
    g.fillRect(sx - 2, sy - 10, sw + 4, 2); // shadow under roof
    // Support pillars at base
    const pillarStep = Math.max(28, sw / Math.ceil(sw / 40));
    for (let px = sx + 12; px < sx + sw - 6; px += pillarStep) {
      g.fillStyle(0x445566, 1);
      g.fillRect(px, sy + sh, 5, 12);
    }
  };

  // ── S/F main grandstand (north side, above track) ──
  drawStand(1340, 112, 680, 80, 0x223355); // Wing A – biggest stand
  // Segment dividers + section signs
  for (let seg = 0; seg < 5; seg++) {
    const sx = 1340 + seg * 136;
    g.fillStyle(0x111122, 1); g.fillRect(sx, 112, 3, 80); // wall
    g.fillStyle(0xFF0000, 1); g.fillRect(sx + 4, 120, 24, 12);
    g.fillStyle(0xFFFFFF, 1); g.fillRect(sx + 6, 123, 12, 6);
  }

  // ── S/F viewing terrace (south side, below track) ──
  drawStand(1460, 338, 430, 38, 0x334433);

  // ── T01 Abbey — left/west outside ──
  drawStand(1738, 810, 100, 180, 0x443322);
  // Second tier behind
  drawStand(1625, 830, 104, 130, 0x334422);

  // ── T03 Village / T04 Loop — east outside ──
  drawStand(2208, 1530, 145, 140, 0x332244);
  drawStand(2210, 1680, 100, 55,  0x443322);

  // ── T04 Loop south inside ──
  drawStand(1836, 1862, 175, 64, 0x224433);

  // ── T06 Brooklands — south bank ──
  drawStand(2596, 1224, 108, 88, 0x334422);

  // ── Hangar straight north grandstand ──
  drawStand(2640, 415, 200, 68, 0x223344);
  drawStand(2848, 420, 100, 60, 0x334422);

  // ── T08 approach — south bank ──
  drawStand(3050, 608, 220, 50, 0x443322);

  // ── T09 Copse — east bank ──
  drawStand(3648, 1160, 66, 210, 0x223344);

  // ── T10 sweep — north bank ──
  drawStand(2790, 1958, 220, 68, 0x334422);

  // ── T11 bottom — south bank ──
  drawStand(2518, 2378, 200, 55, 0x443322);
  drawStand(2200, 2396, 120, 45, 0x334433);

  // ── T13-14 bottom ──
  drawStand(1660, 2388, 180, 60, 0x223355);
  drawStand(1476, 2260, 56, 110, 0x334422);

  // ── T15 Stowe — east bank ──
  drawStand(982, 1418, 78, 160, 0x443322);

  // ── T17 club corner — east side ──
  drawStand(936, 682, 78, 130, 0x334422);
  // Second row
  drawStand(1026, 700, 56, 100, 0x223344);

  // ── T18 back to S/F — south of track ──
  drawStand(1058, 340, 120, 48, 0x334433);

  g.generateTexture('track', TW, TH);
  g.destroy();
}

// Minimap constants — computed from actual waypoint bounding box
const MM_TRACK_X0 = 830, MM_TRACK_Y0 = 240;
const MM_TRACK_W  = 2800, MM_TRACK_H = 2240; // track spans ~830-3630 x, ~240-2480 y
const MM_W = 160, MM_H = 120, MM_PAD = 6;
const MM_SX = (MM_W - MM_PAD * 2) / MM_TRACK_W;
const MM_SY = (MM_H - MM_PAD * 2) / MM_TRACK_H;
export function mmX(wx) { return MM_PAD + (wx - MM_TRACK_X0) * MM_SX; }
export function mmY(wy) { return MM_PAD + (wy - MM_TRACK_Y0) * MM_SY; }

export function makeMinimapTexture(scene) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  g.fillStyle(0x1a1a1a, 0.90);
  g.fillRoundedRect(0, 0, MM_W, MM_H, 6);
  g.lineStyle(3, 0x666666, 1);
  g.beginPath();
  const pts = WAYPOINTS;
  g.moveTo(mmX(pts[0].x), mmY(pts[0].y));
  for (let i = 1; i < pts.length; i++) g.lineTo(mmX(pts[i].x), mmY(pts[i].y));
  g.closePath();
  g.strokePath();
  g.generateTexture('minimap_bg', MM_W, MM_H);
  // Clip: re-draw rounded rect border on top to mask any overflow
  g.lineStyle(2, 0x444444, 1);
  g.strokeRoundedRect(0, 0, MM_W, MM_H, 6);
  g.destroy();
}
