import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveURLSearchParams } from './url-search-params.js';
import { assert, test } from 'vitest';

test('URLSearchParams', () => {
	const params = new ReactiveURLSearchParams();
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	flushSync(() => {
		params.append('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=b&a=c']);

	cleanup();
});
