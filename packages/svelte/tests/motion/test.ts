// @vitest-environment jsdom
import '../helpers.js'; // for the matchMedia polyfill
import { describe, it, assert } from 'vitest';
import { get } from 'svelte/store';
import { spring, tweened, Spring, Tween } from 'svelte/motion';
import { raf } from '../animation-helpers.js';

describe('motion', () => {
	describe('spring', () => {
		it('handles initially undefined values', () => {
			const size = spring();

			size.set(100);
			assert.equal(get(size), 100);
		});
	});

	describe('Spring', () => {
		it('preserves momentum when set while moving', () => {
			raf.reset();
			const size = new Spring(0);

			size.set(100);
			raf.tick(16);
			raf.tick(32);
			raf.tick(48);
			const current = size.current;

			size.set(-100, { preserveMomentum: 1000 });
			raf.tick(64);
			assert.isAbove(size.current, current);
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

		it('updates non-numeric values immediately', () => {
			raf.reset();
			const boolean = tweened(false);

			boolean.set(true, { duration: 100 });

			raf.tick(1);
			assert.equal(get(boolean), true);
		});
	});

	describe('Tween', () => {
		it('sets immediately when duration is 0', () => {
			const size = new Tween(0);

			size.set(100, { duration: 0 });
			assert.equal(size.current, 100);
		});

		it('updates non-numeric values immediately', () => {
			raf.reset();
			const boolean = new Tween(false);

			boolean.set(true, { duration: 100 });

			raf.tick(1);
			assert.equal(boolean.current, true);
		});
	});

	it('updates correctly when initialized with a `null`-ish value', () => {
		const size = new Tween(undefined as unknown as number, { duration: 0 });

		size.set(10);
		assert.equal(size.current, 10);
	});
});
