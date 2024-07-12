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

test('preserves classes', () => {
	class Foo {}
	const frozen = freeze(proxy([new Foo()]));

	assert.ok(frozen[0] instanceof Foo);
});
