// @vitest-environment jsdom
import '../helpers.js'; // for the matchMedia polyfill
import { expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { MediaQuery } from 'svelte/reactivity';
import { effect_root, render_effect } from '../../src/internal/client/reactivity/effects.js';

test('MediaQuery removes its change listener when the last subscriber is destroyed', () => {
	const query = '(min-width: 800px)';
	const media = window.matchMedia(query);
	const add_listener = vi.spyOn(media, 'addEventListener');
	const remove_listener = vi.spyOn(media, 'removeEventListener');
	vi.mocked(window.matchMedia).mockReturnValueOnce(media);

	const media_query = new MediaQuery(query);
	const destroy = effect_root(() => {
		render_effect(() => {
			expect(media_query.current).toBe(false);
		});
	});

	destroy();
	flushSync();

	expect(add_listener).toHaveBeenCalledTimes(1);
	expect(remove_listener.mock.calls).toEqual(add_listener.mock.calls);
});
