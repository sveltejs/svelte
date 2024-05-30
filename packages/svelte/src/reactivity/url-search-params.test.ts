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
		// nothing should happen here
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
	const params = new ReactiveURLSearchParams('a=b&c=d');
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

	flushSync(() => {
		params.set('q', 'f');
	});

	assert.deepEqual(log, ['b', 'd', null, 'new-b', null]);

	cleanup();
});

test('URLSearchParams.getAll', () => {
	const params = new ReactiveURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.get('a'));
		});
		render_effect(() => {
			// this should only logged once because other changes shouldn't affect this
			log.push(params.get('c'));
		});
		render_effect(() => {
			log.push(params.get('q'));
		});
		render_effect(() => {
			log.push(params.getAll('a'));
		});
		render_effect(() => {
			log.push(params.getAll('q'));
		});
	});

	flushSync(() => {
		// this shouldn't affect params.get(a) because it already exists
		params.append('a', 'b1');
	});

	flushSync(() => {
		params.append('q', 'z');
	});

	assert.deepEqual(log, ['b', 'd', null, ['b'], [], ['b', 'b1'], 'z', ['z']]);

	cleanup();
});

test('URLSearchParams.instanceOf', () => {
	assert.equal(new ReactiveURLSearchParams() instanceof URLSearchParams, true);
});
