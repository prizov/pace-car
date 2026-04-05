import { config } from './game/config.js';

const params = new URLSearchParams(window.location.search);
const devFlags = Object.freeze({
  skipIntro: params.get('skipIntro') === '1',
  debug: params.get('debug') === '1',
});

window.__PACE_CAR_DEV__ = devFlags;

const game = new Phaser.Game(config);

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
    setMode(mode) {
      const scene = getGameScene();
      return scene?.debugSetMode(mode) ?? null;
    },
    activatePrimary() {
      const scene = getGameScene();
      scene?.activatePrimaryAbility();
      return scene?.getDebugState() ?? null;
    },
  },
};
