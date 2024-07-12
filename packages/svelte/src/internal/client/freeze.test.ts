import { freeze } from './freeze.js';
import { assert, test } from 'vitest';
import { proxy } from './proxy.js';

test('freezes an object', () => {
	const frozen = freeze({ a: 1 });

	assert.throws(() => {
		// @ts-expect-error
		frozen.a += 1;
	}, /Cannot assign to read only property/);
});

test('throws if argument is a state proxy', () => {
	assert.throws(() => freeze(proxy({})), /state_frozen_invalid_argument/);
});
