import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveURLSearchParams } from './url-search-params.js';
import { assert, test } from 'vitest';

test('URLSearchParams.set', () => {
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
		params.set('a', 'c');
	});

	flushSync(() => {
		params.set('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=c']);

	cleanup();
});

test('URLSearchParams.append', () => {
	const params = new ReactiveURLSearchParams();
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.append('a', 'b');
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

test('URLSearchParams.delete', () => {
	const params = new ReactiveURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.delete('a');
	});

	flushSync(() => {
		params.delete('a');
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	assert.deepEqual(log, ['a=b&c=d', 'c=d', 'c=d&a=b']);

	cleanup();
});

test('URLSearchParams.get', () => {
	const params = new ReactiveURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.get('a'));
		});
		render_effect(() => {
			log.push(params.get('c'));
		});
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	flushSync(() => {
		params.set('a', 'new-b');
	});

	flushSync(() => {
		params.delete('a');
	});

	assert.deepEqual(log, ['b', 'd', 'new-b', null]);

	cleanup();
});
