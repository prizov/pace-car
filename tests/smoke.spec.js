import { expect, test } from '@playwright/test';

async function waitForState(page, predicate, timeout = 15_000) {
  await page.waitForFunction(predicate, null, { timeout });
  return page.evaluate(() => window.__PACE_CAR__.getState());
}

test('boots and exercises the core transformation loop', async ({ page }) => {
  await page.goto('/?skipIntro=1&debug=1');

  const initialState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.ready && window.__PACE_CAR__.getState().preRace === false,
  );

  expect(initialState.mode).toBe('car');
  expect(initialState.carsRemaining).toBe(22);

  await page.evaluate(() => window.__PACE_CAR__.actions.accelerateForward());

  const movingState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.speed > 0,
  );
  expect(movingState.speed).toBeGreaterThan(0);

  await page.evaluate(() => window.__PACE_CAR__.actions.activatePrimary());
  const turboState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.turboActive === true,
  );
  expect(turboState.mode).toBe('car');

  await page.evaluate(() => window.__PACE_CAR__.actions.setMode('jet'));
  const jetState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.mode === 'jet',
  );
  expect(jetState.mode).toBe('jet');

  await page.evaluate(() => window.__PACE_CAR__.actions.activatePrimary());
  const missileState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.missileCooldown > 0,
  );
  expect(missileState.targetedCar).not.toBeNull();

  await page.evaluate(() => window.__PACE_CAR__.actions.warpToProgress(0.18));

  await page.evaluate(() => window.__PACE_CAR__.actions.setMode('gigarocket'));
  const rocketState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.mode === 'gigarocket',
  );
  expect(rocketState.mode).toBe('gigarocket');

  await page.evaluate(() => window.__PACE_CAR__.actions.activatePrimary());
  const chargingState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.gigarocketCharging === true,
  );
  expect(chargingState.gigarocketCharging).toBe(true);

  await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.mode === 'car' && window.__PACE_CAR__.getState().gigarocketCharging === false,
    8_000,
  );

  await page.evaluate(() => window.__PACE_CAR__.actions.warpToProgress(0.34));

  await page.evaluate(() => window.__PACE_CAR__.actions.setMode('tank'));
  const tankState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.mode === 'tank',
  );
  expect(tankState.mode).toBe('tank');

  await page.evaluate(() => window.__PACE_CAR__.actions.activatePrimary());
  const shellState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.tankShellCooldown > 0,
  );
  expect(shellState.tankShellCooldown).toBeGreaterThan(0);

  await page.evaluate(() => window.__PACE_CAR__.actions.warpToProgress(0.52));

  await page.evaluate(() => window.__PACE_CAR__.actions.setMode('gigacat'));
  const catState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.mode === 'gigacat',
  );
  expect(catState.mode).toBe('gigacat');

  await page.evaluate(() => window.__PACE_CAR__.actions.activatePrimary());
  const pounceState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.gigaCatPouncing === true,
  );
  expect(pounceState.gigaCatPouncing).toBe(true);

  await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.gigaCatPouncing === false,
    8_000,
  );

  await page.evaluate(() => window.__PACE_CAR__.actions.warpToProgress(0.7));

  await page.evaluate(() => window.__PACE_CAR__.actions.setMode('seal'));
  const sealState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.mode === 'seal',
  );
  expect(sealState.mode).toBe('seal');

  await page.evaluate(() => window.__PACE_CAR__.actions.activatePrimary());
  const gasState = await waitForState(
    page,
    () => window.__PACE_CAR__?.getState()?.sealFartCooldown > 0 && window.__PACE_CAR__.getState().sealClouds > 0,
  );
  expect(gasState.sealClouds).toBeGreaterThan(0);

  await page.screenshot({ path: 'test-results/smoke-final-state.png' });
});
