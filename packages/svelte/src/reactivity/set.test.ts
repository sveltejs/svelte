import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveSet } from './set.js';
import { assert, test } from 'vitest';

test('set.values()', () => {
	const set = new ReactiveSet([1, 2, 3, 4, 5]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(set.size);
		});

		render_effect(() => {
			log.push(set.has(3));
		});

		render_effect(() => {
			log.push(Array.from(set));
		});
	});

	flushSync(() => {
		set.delete(3);
	});

	flushSync(() => {
		set.clear();
	});

	assert.deepEqual(log, [5, true, [1, 2, 3, 4, 5], 4, false, [1, 2, 4, 5], 0, false, []]);

	cleanup();
});

test('set.has(...)', () => {
	const set = new ReactiveSet([1, 2, 3]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('has 1', set.has(1));
		});

		render_effect(() => {
			log.push('has 2', set.has(2));
		});

		render_effect(() => {
			log.push('has 3', set.has(3));
		});
	});

	flushSync(() => {
		set.delete(2);
	});

	flushSync(() => {
		set.add(2);
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

test('set.delete(...)', () => {
	const set = new ReactiveSet([1, 2, 3]);

	assert.equal(set.delete(3), true);
	assert.equal(set.delete(3), false);

	assert.deepEqual(Array.from(set.values()), [1, 2]);
});

test('set.forEach()', () => {
	const set = new ReactiveSet([1, 2, 3, 4, 5]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			set.forEach((v) => log.push(v));
		});
	});

	flushSync(() => {
		set.add(6);
	});

	assert.deepEqual(log, [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6]);

	cleanup();
});

test('not invoking reactivity when value is not in the set after changes', () => {
	const set = new ReactiveSet([1, 2]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('has 1', set.has(1));
		});

		render_effect(() => {
			log.push('has 2', set.has(2));
		});

		render_effect(() => {
			log.push('has 3', set.has(3));
		});
	});

	flushSync(() => {
		set.delete(2);
	});

	flushSync(() => {
		set.add(2);
	});

	assert.deepEqual(log, [
		'has 1',
		true,
		'has 2',
		true,
		'has 3',
		false,
		'has 2',
		false,
		'has 3',
		false,
		'has 2',
		true,
		'has 3',
		false
	]);

	cleanup();
});

test('Set.instanceOf', () => {
	assert.equal(new ReactiveSet() instanceof Set, true);
});
