import { test, expect } from 'vitest';
import { Renderer, SSRState } from './renderer.js';
import { EVENT_CAPTURE_SCRIPT, EVENT_CAPTURE_SCRIPT_SHA256 } from './event-capture.js';
import { sha256 } from './crypto.js';
import { event_capture } from './index.js';

test('EVENT_CAPTURE_SCRIPT_SHA256 matches the hashed script body', async () => {
	// Drift guard: if you change EVENT_CAPTURE_SCRIPT, recompute the hash.
	expect(`sha256-${await sha256(EVENT_CAPTURE_SCRIPT)}`).toBe(EVENT_CAPTURE_SCRIPT_SHA256);
});

test('event_capture returns inline attribute when csp is not enabled', () => {
	const renderer = new Renderer(new SSRState('sync'));
	expect(event_capture(renderer, 'onload')).toBe(' onload="this.__e=event"');
	expect(renderer.global.needs_event_replay_script).toBe(false);
});

test('event_capture returns empty string and arms the head script under csp.hash', () => {
	const renderer = new Renderer(new SSRState('sync', '', { hash: true }));
	expect(event_capture(renderer, 'onload')).toBe('');
	expect(event_capture(renderer, 'onerror')).toBe('');
	expect(renderer.global.needs_event_replay_script).toBe(true);
});

test('event_capture returns empty string and arms the head script under csp.nonce', () => {
	const renderer = new Renderer(new SSRState('sync', '', { nonce: 'abc' }));
	expect(event_capture(renderer, 'onload')).toBe('');
	expect(renderer.global.needs_event_replay_script).toBe(true);
});
