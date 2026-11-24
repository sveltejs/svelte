import { afterEach, beforeEach, assert, test } from 'vitest';
import { fork } from '../internal/client/reactivity/batch.js';
import { enable_async_mode_flag, disable_async_mode_flag } from '../internal/flags/index.js';
import { SvelteMap } from './map.js';

beforeEach(enable_async_mode_flag);
afterEach(disable_async_mode_flag);

test('discarding a deletion preserves entries', () => {
	const map = new SvelteMap([['a', 1]]);
	const f = fork(() => map.delete('a'));
	f.discard();
	assert.equal(map.size, 1);
	assert.deepEqual([...map], [['a', 1]]);
});

test('discarding clear preserves entries', () => {
	const map = new SvelteMap([['a', 1]]);
	const f = fork(() => map.clear());
	f.discard();
	assert.equal(map.size, 1);
	assert.deepEqual([...map], [['a', 1]]);
});

test('discarding an insertion preserves missing keys', () => {
	const map = new SvelteMap<string, number>();
	const f = fork(() => map.set('a', 1));
	f.discard();
	assert.equal(map.size, 0);
	assert.equal(map.has('a'), false);
});

test('committing structural writes updates entries and lookups', async () => {
	const map = new SvelteMap([['a', 1]]);
	await fork(() => map.delete('a')).commit();
	assert.deepEqual([...map], []);
	assert.equal(map.has('a'), false);
	await fork(() => map.set('a', 2)).commit();
	assert.deepEqual([...map], [['a', 2]]);
	assert.equal(map.get('a'), 2);
	await fork(() => map.clear()).commit();
	assert.deepEqual([...map], []);
	assert.equal(map.has('a'), false);
});
