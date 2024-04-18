import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveMap } from './map.js';
import { assert, test } from 'vitest';

test('map.values()', () => {
	const map = new ReactiveMap([
		[1, 1],
		[2, 2],
		[3, 3],
		[4, 4],
		[5, 5]
	]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(map.size);
		});

		render_effect(() => {
			log.push(map.has(3));
		});

		render_effect(() => {
			log.push(Array.from(map.values()));
		});
	});

	flushSync(() => {
		map.delete(3);
	});

	flushSync(() => {
		map.clear();
	});

	assert.deepEqual(log, [5, true, [1, 2, 3, 4, 5], 4, false, [1, 2, 4, 5], 0, false, []]);

	cleanup();
});

test('map.get(...)', () => {
	const map = new ReactiveMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('get 1', map.get(1));
		});

		render_effect(() => {
			log.push('get 2', map.get(2));
		});

		render_effect(() => {
			log.push('get 3', map.get(3));
		});
	});

	flushSync(() => {
		map.delete(2);
	});

	flushSync(() => {
		map.set(2, 2);
	});

	assert.deepEqual(log, ['get 1', 1, 'get 2', 2, 'get 3', 3, 'get 2', undefined, 'get 2', 2]);

	cleanup();
});

test('map.has(...)', () => {
	const map = new ReactiveMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('has 1', map.has(1));
		});

		render_effect(() => {
			log.push('has 2', map.has(2));
		});

		render_effect(() => {
			log.push('has 3', map.has(3));
		});
	});

	flushSync(() => {
		map.delete(2);
	});

	flushSync(() => {
		map.set(2, 2);
	});

	assert.deepEqual(log, [
		'has 1',
		true,
		'has 2',
		true,
		'has 3',
		true,
		'has 2',
		false,
		'has 2',
		true
	]);

	cleanup();
});

test('map.forEach(...)', () => {
	const map = new ReactiveMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	const log: any = [];
	const this_arg = {};

	map.forEach(function (this: unknown, ...args) {
		log.push([...args, this]);
	}, this_arg);

	assert.deepEqual(log, [
		[1, 1, map, this_arg],
		[2, 2, map, this_arg],
		[3, 3, map, this_arg]
	]);
});

test('map.delete(...)', () => {
	const map = new ReactiveMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	assert.equal(map.delete(3), true);
	assert.equal(map.delete(3), false);

	assert.deepEqual(Array.from(map.values()), [1, 2]);
});

test('map handling of undefined values', () => {
	const map = new ReactiveMap();

	const log: any = [];

	const cleanup = effect_root(() => {
		map.set(1, undefined);

		render_effect(() => {
			log.push(map.get(1));
		});

		flushSync(() => {
			map.delete(1);
		});

		flushSync(() => {
			map.set(1, 1);
		});
	});

	assert.deepEqual(log, [undefined, undefined, 1]);

	cleanup();
});
