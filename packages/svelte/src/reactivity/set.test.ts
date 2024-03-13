import { pre_effect, user_root_effect } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../main/main-client.js';
import { ReactiveSet } from './set.js';
import { assert, test } from 'vitest';

test('set.values()', () => {
	const set = new ReactiveSet([1, 2, 3, 4, 5]);

	const log: any = [];

	const cleanup = user_root_effect(() => {
		pre_effect(() => {
			log.push(set.size);
		});

		pre_effect(() => {
			log.push(set.has(3));
		});

		pre_effect(() => {
			log.push(Array.from(set));
		});
	});

	flushSync(() => {
		set.delete(3);
	});

	flushSync(() => {
		set.clear();
	});

	// TODO looks like another effect ordering bug — sequence should be <size, has, values>,
	// but values is reversed at end
	assert.deepEqual(log, [5, true, [1, 2, 3, 4, 5], 4, false, [1, 2, 4, 5], 0, [], false]);

	cleanup();
});
