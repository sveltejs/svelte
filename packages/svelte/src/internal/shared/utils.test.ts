import { assert, test } from 'vitest';
import { to_array } from './utils';

test('to_array returns arrays unchanged', () => {
	const array = [1, 2, 3];
	assert.equal(to_array(array, 1), array);
});

test('to_array reads at most n values from iterables', () => {
	assert.deepEqual(to_array(new Set([1, 2, 3]), 2), [1, 2]);
});

test('to_array reads at most n values from array-likes', () => {
	assert.deepEqual(to_array({ 0: 'a', 1: 'b', length: 1000 }, 1), ['a']);
	assert.deepEqual(to_array({ 0: 'a', length: 1 }, 3), ['a']);
	assert.deepEqual(to_array({ 0: 'a' } as any, 1), []);
});

test('to_array converts array-likes fully when n is unspecified', () => {
	assert.deepEqual(to_array({ 0: 'a', 1: 'b', length: 2 }), ['a', 'b']);
});
