// ── Constants ──────────────────────────────────────────────
export const W = 1280, H = 720;
export const PLAYER_MAX_SPEED = 520;
export const PLAYER_TURBO_SPEED = 1100; // turbo max speed
export const AI_MAX_SPEED = 580;
export const BASE_DAMAGE = 34; // one hit at full speed = ~34 dmg; 3 hits kills (100 hp)
export const TURBO_DURATION = 1500;  // ms
export const TURBO_COOLDOWN = 5000;  // ms
export const JET_SPEED = 950;               // jet mode max speed
export const MISSILE_SPEED = 1400;          // missile projectile speed px/s
export const MISSILE_COOLDOWN = 600;        // ms between missile shots
export const MISSILE_RANGE = 650;           // targeting radius (px)
export const GIGAROCKET_SPEED = 280;        // slow pre-launch movement
export const GIGAROCKET_CHARGE_SPEED = 3200;// launch speed px/s
export const GIGAROCKET_CHARGE_DURATION = 2000; // ms of charge
export const TANK_SPEED = 310;              // tank max speed (heavy)
export const TANK_TURN = 68;                // tank rotation speed deg/s
export const TANK_SHELL_SPEED = 1800;       // shell projectile speed px/s
export const TANK_SHELL_COOLDOWN = 800;     // ms between shots
export const GIGACAT_SPEED = 380;           // cat walking speed
export const GIGACAT_POUNCE_SPEED = 1500;   // pounce launch speed px/s
export const GIGACAT_POUNCE_DURATION = 650; // ms of mid-air time
export const GIGACAT_POUNCE_RADIUS = 160;   // stomp kill radius on landing
export const GIGACAT_POUNCE_COOLDOWN = 2200;// ms between pounces
