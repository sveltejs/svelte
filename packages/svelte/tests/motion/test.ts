import { describe, it, assert } from 'vitest';
import { get } from 'svelte/store';
import { spring, tweened } from 'svelte/motion';

describe('motion', () => {
	describe('spring', () => {
		it('handles initially undefined values', () => {
			const size = spring();

			size.set(100);
			assert.equal(get(size), 100);
		});
	});

	describe('tweened', () => {
		it('handles initially undefined values', () => {
			const size = tweened();

			size.set(100);
			assert.equal(get(size), 100);
		});

		it('sets immediately when duration is 0', () => {
			const size = tweened(0);

			size.set(100, { duration: 0 });
			assert.equal(get(size), 100);
		});

		it('updates correctly when initialized with a `null`-ish value', () => {
			const size = tweened(undefined as unknown as number, { duration: 0 });

			size.set(10);
			assert.equal(get(size), 10);

			size.update((v) => v + 10);
			assert.equal(get(size), 20);
		});
	});
});
