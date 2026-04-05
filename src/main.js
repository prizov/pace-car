import { config } from './game/config.js';

const params = new URLSearchParams(window.location.search);
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
const devFlags = Object.freeze({
  skipIntro: params.get('skipIntro') === '1',
  debug: params.get('debug') === '1',
});

window.__PACE_CAR_DEV__ = devFlags;

if (isTouchDevice) {
  document.body.classList.add('touch-device');
}

config.parent = 'game-root';
const game = new Phaser.Game(config);

const fullscreenButton = document.getElementById('fullscreen-toggle');

function syncFullscreenState() {
  document.body.classList.toggle('fullscreen-active', !!document.fullscreenElement);
  if (fullscreenButton) {
    fullscreenButton.textContent = document.fullscreenElement ? 'EXIT' : 'FULL';
  }
}

async function requestPhoneFullscreen() {
  const shell = document.getElementById('app-shell');
  if (!shell || !document.fullscreenEnabled) return false;

  if (!document.fullscreenElement) {
    await shell.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }

  if (screen.orientation?.lock && document.fullscreenElement) {
    await screen.orientation.lock('landscape').catch(() => {});
  }

  syncFullscreenState();
  return !!document.fullscreenElement;
}

fullscreenButton?.addEventListener('click', () => {
  requestPhoneFullscreen();
});

document.addEventListener('fullscreenchange', syncFullscreenState);
syncFullscreenState();

function getActiveSceneKey() {
  const activeScenes = game.scene.getScenes(true);
  return activeScenes.at(-1)?.scene.key ?? null;
}

function getGameScene() {
  return game.scene.keys.GameScene ?? null;
}

window.__PACE_CAR__ = {
  bridgeVersion: 1,
  devFlags,
  game,
  getActiveSceneKey,
  getState() {
    const scene = getGameScene();
    if (!scene || typeof scene.getDebugState !== 'function') {
      return {
        ready: false,
        scene: getActiveSceneKey(),
      };
    }
    return scene.getDebugState();
  },
  actions: {
    accelerateForward(boost = 1) {
      const scene = getGameScene();
      return scene?.debugAccelerateForward(boost) ?? null;
    },
    warpToWaypoint(index) {
      const scene = getGameScene();
      return scene?.debugWarpToWaypoint(index) ?? null;
    },
    warpToProgress(progress) {
      const scene = getGameScene();
      return scene?.debugWarpToProgress(progress) ?? null;
    },
    setMode(mode) {
      const scene = getGameScene();
      return scene?.debugSetMode(mode) ?? null;
    },
    activatePrimary() {
      const scene = getGameScene();
      scene?.activatePrimaryAbility();
      return scene?.getDebugState() ?? null;
    },
    enterFullscreen() {
      return requestPhoneFullscreen();
    },
  },
};
