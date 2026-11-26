// @vitest-environment node

// Custom renderers can run in environments without browser globals (e.g. Node with the
// `svelte-custom-renderer` condition). These tests make sure the parts of the client
// runtime that are reachable from such environments don't rely on them.

import { afterEach, assert, test } from 'vitest';
import { tick } from 'svelte';
import {
	disable_async_mode_flag,
	enable_async_mode_flag,
	enable_custom_renderers_flag
} from '../../src/internal/flags/index.js';

enable_custom_renderers_flag();

afterEach(() => {
	disable_async_mode_flag();
});

test('there are no browser globals in this environment', () => {
	assert.equal(typeof window, 'undefined');
	assert.equal(typeof requestAnimationFrame, 'undefined');
});

test('`tick` resolves without `requestAnimationFrame`', async () => {
	await tick();
});

test('`tick` resolves without `requestAnimationFrame` in async mode', async () => {
	enable_async_mode_flag();
	await tick();
});

test('`svelte/motion` can be imported without `window`', async () => {
	const { prefersReducedMotion } = await import('svelte/motion');
	assert.equal(prefersReducedMotion.current, false);
});

test('`MediaQuery` uses the fallback value without `window`', async () => {
	const { MediaQuery } = await import('svelte/reactivity');
	assert.equal(new MediaQuery('min-width: 800px').current, false);
	assert.equal(new MediaQuery('min-width: 800px', true).current, true);
});

test('`Tween` runs to completion without `requestAnimationFrame`', async () => {
	const { Tween } = await import('svelte/motion');
	const tween = new Tween(0, { duration: 50 });

	await tween.set(10);
	assert.equal(tween.current, 10);
});

test('`Spring` settles without `requestAnimationFrame`', async () => {
	const { Spring } = await import('svelte/motion');
	const spring = new Spring(0, { stiffness: 0.5, damping: 1 });

	await spring.set(10);
	assert.equal(spring.current, 10);
});
