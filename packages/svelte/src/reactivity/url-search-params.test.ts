import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { assert, test } from 'vitest';
import { SvelteURLSearchParams } from './url-search-params';

test('new URLSearchParams', () => {
	const params = new SvelteURLSearchParams('a=b');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.set('a', 'c');
	});

	flushSync(() => {
		// nothing should happen here
		params.set('a', 'c');
	});

	assert.deepEqual(log, ['a=b', 'a=c']);

	cleanup();
});

test('URLSearchParams.set', () => {
	const params = new SvelteURLSearchParams();
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
		// nothing should happen here
		params.set('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=c']);

	cleanup();
});

test('URLSearchParams.append', () => {
	const params = new SvelteURLSearchParams();
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
		// nothing should happen here
		params.set('a', 'b');
	});

	flushSync(() => {
		params.append('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=b&a=c']);

	cleanup();
});

test('URLSearchParams.delete', () => {
	const params = new SvelteURLSearchParams('a=b&c=d');
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
		// nothing should happen here
		params.delete('a');
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	assert.deepEqual(log, ['a=b&c=d', 'c=d', 'c=d&a=b']);

	cleanup();
});

test('URLSearchParams.get', () => {
	const params = new SvelteURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.get('a'));
		});
		render_effect(() => {
			log.push(params.get('c'));
		});
		render_effect(() => {
			log.push(params.get('e'));
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

	assert.deepEqual(log, ['b', 'd', null, 'new-b', 'd', null, null, 'd', null]);

	cleanup();
});

test('URLSearchParams.getAll', () => {
	const params = new SvelteURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.getAll('a'));
		});
		render_effect(() => {
			log.push(params.getAll('q'));
		});
	});

	flushSync(() => {
		params.append('a', 'b1');
	});

	flushSync(() => {
		params.append('q', 'z');
	});

	assert.deepEqual(log, [
		// initial
		['b'],
		[],
		// first flush
		['b', 'b1'],
		[],
		// second flush
		['b', 'b1'],
		['z']
	]);

	cleanup();
});

test('URLSearchParams.toString', () => {
	const params = new SvelteURLSearchParams();
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

test('SvelteURLSearchParams instanceof URLSearchParams', () => {
	assert.ok(new SvelteURLSearchParams() instanceof URLSearchParams);
});
