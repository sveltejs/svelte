import { afterAll, beforeAll, expect, test } from 'vitest';
import { Renderer } from './renderer.js';
import type { Component } from 'svelte';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';
import { hydratable } from './hydratable.js';

beforeAll(() => {
	enable_async_mode_flag();
});

afterAll(() => {
	disable_async_mode_flag();
});

test('treats replacement tokens in hydratable promise values as literals', async () => {
	const component = (renderer: Renderer) => {
		hydratable('key', () => Promise.resolve(`$'`));
		renderer.child(async () => {
			await Promise.resolve();
		});
		renderer.push('ok');
	};

	const { head } = await Renderer.render(component as unknown as Component);
	const script_match = head.match(/<script(?:\s[^>]*)?>([\s\S]*)<\/script>/);

	expect(script_match, 'expected hydratable script in head output').toBeTruthy();

	const script_content = script_match![1];
	expect(script_content).toContain('const h = (window.__svelte ??= {}).h ??= new Map();');
	expect(script_content).toContain('r("$\'")');
	expect(script_content).toMatch(/\[\s*"key"\s*,\s*r\("\$'"\)\s*\]/);
});
