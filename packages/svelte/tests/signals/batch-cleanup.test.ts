import { afterEach, assert, it } from 'vitest';
import {
	Batch,
	clear,
	get_batches,
	merge_requests
} from '../../src/internal/client/reactivity/batch';
import { source } from '../../src/internal/client/reactivity/sources';

afterEach(() => {
	for (const batch of get_batches()) batch.discard();
	clear();
});

it('retires a discarded batch before reentrant cleanup and releases private captures', () => {
	const first = new Batch();
	const second = new Batch();
	const survivor = new Batch();
	const calls: string[] = [];
	const value = source(0);
	first.current.set(value, { v: 1, wv: 1, e: false, assigned: false });
	first.previous.set(value, { v: 0, wv: 0, e: false, assigned: false });
	merge_requests.add(first);
	first.ondiscard(() => {
		calls.push('first');
		first.discard();
		second.discard();
	});
	second.ondiscard(() => calls.push('second'));

	first.discard();
	first.discard();
	assert.deepEqual(calls, ['first', 'second']);
	assert.deepEqual(get_batches(), [survivor]);
	assert.equal(first.prev, null);
	assert.equal(first.next, null);
	assert.equal(second.prev, null);
	assert.equal(second.next, null);
	assert.equal(first.current.size, 0);
	assert.equal(first.previous.size, 0);
	assert.equal(first.records, null);
	assert.equal(merge_requests.has(first), false);
});

it('a callback removing an intervening batch does not truncate cleanup traversal', () => {
	const first = new Batch();
	const second = new Batch();
	const third = new Batch();
	const calls: number[] = [];
	first.ondiscard(() => {
		calls.push(1);
		second.discard();
	});
	second.ondiscard(() => calls.push(2));
	third.ondiscard(() => calls.push(3));

	for (const batch of get_batches()) batch.discard();
	assert.deepEqual(calls, [1, 2, 3]);
	assert.deepEqual(get_batches(), []);
});
