// Team colours (main body colour, accent)
export const TEAMS = {
  mclaren:      { body: 0xFF8000, accent: 0x0090D0 },
  mercedes:     { body: 0x1A1A1A, accent: 0xC0C0C0 },
  ferrari:      { body: 0xE8002D, accent: 0xFFFF00 },
  redbull:      { body: 0x1B3F8B, accent: 0xCC0000 },
  williams:     { body: 0x005AFF, accent: 0xFFFFFF },
  astonmartin:  { body: 0x00594F, accent: 0x00FF88 },
  racingbulls:  { body: 0xEEEEEE, accent: 0x005AFF },
  haas:         { body: 0xFFFFFF, accent: 0x222222 },
  alpine:       { body: 0x0051FF, accent: 0xFF00AA },
  audi:         { body: 0x111111, accent: 0x888888 },
  cadillac:     { body: 0xF0F0F0, accent: 0x003087 },
};

// Full 2026 grid
export const DRIVERS = [
  { name:'Lando Norris',    team:'mclaren',     special:'norris'     },
  { name:'Oscar Piastri',   team:'mclaren',     special:null         },
  { name:'George Russell',  team:'mercedes',    special:null         },
  { name:'Kimi Antonelli',  team:'mercedes',    special:null         },
  { name:'Charles Leclerc', team:'ferrari',     special:null         },
  { name:'Lewis Hamilton',  team:'ferrari',     special:'hamilton'   },
  { name:'Max Verstappen',  team:'redbull',     special:'verstappen' },
  { name:'Isack Hadjar',    team:'redbull',     special:null         },
  { name:'Carlos Sainz',    team:'williams',    special:null         },
  { name:'Alex Albon',      team:'williams',    special:null         },
  { name:'Fernando Alonso', team:'astonmartin', special:'alonso'     },
  { name:'Lance Stroll',    team:'astonmartin', special:'stroll'     },
  { name:'Liam Lawson',     team:'racingbulls', special:'lawson'     },
  { name:'Arvid Lindblad',  team:'racingbulls', special:null         },
  { name:'Esteban Ocon',    team:'haas',        special:null         },
  { name:'Ollie Bearman',   team:'haas',        special:null         },
  { name:'Pierre Gasly',    team:'alpine',      special:null         },
  { name:'Franco Colapinto',team:'alpine',      special:null         },
  { name:'Nico Hülkenberg', team:'audi',        special:null         },
  { name:'Gabriel Bortoleto',team:'audi',       special:null         },
  { name:'Sergio Pérez',    team:'cadillac',    special:null         },
  { name:'Valtteri Bottas', team:'cadillac',    special:'bottas'     },
];

export const COMMENTATOR_GENERIC = [
  "THE SAFETY CAR HAS COMPLETELY LOST THE PLOT!",
  "I've never seen anything like this in 40 years of Formula 1!",
  "Stewards are investigating... the safety car.",
  "Race control has gone very quiet.",
  "That's another one down. Incredible scenes.",
];
export const COMMENTATOR_SPECIAL = {
  norris:     "THE WORLD CHAMPION IS OUT! WHO AUTHORISED THIS?!",
  hamilton:   "Lewis Hamilton, seven-time world champion — gone. Just like that.",
  alonso:     "Fernando Alonso has FINALLY been stopped. It took four hits.",
  stroll:     "Lance Stroll retires. The Honda just couldn't take it.",
  bottas:     "Valtteri Bottas. It is what it is.",
  verstappen: "Max Verstappen briefly fought back. Incredible instinct, ultimately futile.",
  lawson:     "Liam Lawson eliminated! New Zealand's finest, taken out by a road car.",
};

// ── Silverstone Waypoints — accurate 2026 layout ───────────
// Traced from the official circuit map, corners T01–T18 in race order.
// S/F straight is horizontal at y≈280, race direction = east (+x).
// World space 4000×3000. speedFactor: 1=flat out, 0.4=tight hairpin.
export const WAYPOINTS = [
  // ── S/F straight → T01 Abbey (sweeping right, heading south) ──
  {x:1965,y:278,s:1.0},
  {x:1942,y:370,s:0.88},
  {x:1924,y:510,s:0.72},
  {x:1914,y:648,s:0.60},
  {x:1911,y:790,s:0.48}, // T01 apex
  {x:1918,y:882,s:0.55},
  // ── T01 exit → T02 Farm (gentle left kink) ──
  {x:1938,y:992,s:0.72},
  {x:1960,y:1108,s:0.80},
  {x:1976,y:1212,s:0.76}, // T02
  {x:1988,y:1312,s:0.82},
  // ── T02 → T03 Village (right hairpin) ──
  {x:2018,y:1412,s:0.85},
  {x:2068,y:1502,s:0.74},
  {x:2108,y:1558,s:0.62},
  {x:2136,y:1600,s:0.44}, // T03 apex
  {x:2128,y:1652,s:0.46},
  // ── T03 → T04 The Loop (tight left) ──
  {x:2076,y:1702,s:0.51},
  {x:2018,y:1744,s:0.44},
  {x:1994,y:1778,s:0.40}, // T04 apex
  {x:2000,y:1820,s:0.44},
  {x:2050,y:1852,s:0.50},
  // ── T04 → T05 Aintree (right) ──
  {x:2106,y:1872,s:0.55},
  {x:2148,y:1894,s:0.58},
  {x:2168,y:1910,s:0.54}, // T05 apex
  {x:2216,y:1902,s:0.62},
  // ── Wellington Straight → T06 Brooklands (right) ──
  {x:2292,y:1858,s:0.78},
  {x:2372,y:1788,s:0.88},
  {x:2442,y:1712,s:0.93},
  {x:2502,y:1622,s:0.93},
  {x:2548,y:1524,s:0.87},
  {x:2564,y:1424,s:0.80},
  {x:2565,y:1342,s:0.58}, // T06 apex
  {x:2558,y:1262,s:0.66},
  // ── T06 → T07 Luffield (right, heading north along right loop) ──
  {x:2582,y:1092,s:0.82},
  {x:2626,y:892,s:0.91},
  {x:2684,y:742,s:0.94},
  {x:2738,y:612,s:0.91},
  {x:2808,y:514,s:0.54}, // T07 apex
  {x:2866,y:492,s:0.64},
  // ── T07 → T08 (long right-hand straight heading east) ──
  {x:2992,y:509,s:0.96},
  {x:3118,y:529,s:1.0},
  {x:3218,y:548,s:1.0},
  {x:3292,y:566,s:0.66},
  {x:3295,y:594,s:0.57}, // T08 apex
  {x:3346,y:650,s:0.65},
  // ── T08 → T09 (heading south then curving west) ──
  {x:3440,y:782,s:0.82},
  {x:3524,y:962,s:0.90},
  {x:3578,y:1132,s:0.86},
  {x:3578,y:1282,s:0.68},
  {x:3578,y:1316,s:0.50}, // T09 apex
  {x:3548,y:1408,s:0.57},
  // ── T09 → T10 (sweeping west-south past the right loop exit) ──
  {x:3472,y:1532,s:0.72},
  {x:3368,y:1660,s:0.82},
  {x:3240,y:1784,s:0.88},
  {x:3096,y:1900,s:0.91},
  {x:2956,y:1994,s:0.91},
  {x:2888,y:2076,s:0.63}, // T10 apex
  {x:2800,y:2154,s:0.70},
  // ── T10 → T11 → T12 → T13 → T14 (bottom, heading west) ──
  {x:2694,y:2234,s:0.76},
  {x:2624,y:2308,s:0.58}, // T11
  {x:2474,y:2364,s:0.77},
  {x:2306,y:2384,s:0.72}, // T12
  {x:2094,y:2414,s:0.82},
  {x:1934,y:2432,s:0.76}, // T13
  {x:1748,y:2404,s:0.77},
  {x:1568,y:2312,s:0.59}, // T14 apex
  {x:1478,y:2200,s:0.66},
  // ── T14 → T15 Stowe (northwest diagonal) ──
  {x:1364,y:2060,s:0.77},
  {x:1244,y:1920,s:0.83},
  {x:1124,y:1804,s:0.88},
  {x:1014,y:1704,s:0.92},
  {x:914,y:1516,s:0.54},  // T15 apex
  {x:888,y:1400,s:0.62},
  // ── T15 → T16 → T17 (Hangar straight, heading north) ──
  {x:869,y:1250,s:0.82},
  {x:862,y:1100,s:0.88},  // T16 kink
  {x:862,y:950,s:0.92},
  {x:866,y:800,s:0.95},
  {x:870,y:774,s:0.62},  // T17 apex
  {x:902,y:680,s:0.75},
  // ── T17 → T18 (northeast, top of left rectangle) ──
  {x:962,y:570,s:0.82},
  {x:1022,y:480,s:0.87},
  {x:1082,y:400,s:0.90},
  {x:1148,y:292,s:0.74},  // T18 apex
  {x:1232,y:282,s:0.87},
  // ── T18 → S/F straight (east) ──
  {x:1382,y:278,s:1.0},
  {x:1532,y:277,s:1.0},
  {x:1702,y:276,s:1.0},
  {x:1852,y:276,s:1.0},
  // → closes back to index 0: {x:1965,y:278}
];
export const WP_COUNT = WAYPOINTS.length;
