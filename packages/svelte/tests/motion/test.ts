// @vitest-environment jsdom
import '../helpers.js'; // for the matchMedia polyfill
import { describe, it, assert } from 'vitest';
import { get } from 'svelte/store';
import { spring, tweened, Tween } from 'svelte/motion';
import { raf } from '../animation-helpers.js';

describe('motion', () => {
	describe('spring', () => {
		it('handles initially undefined values', () => {
			const size = spring();

			size.set(100);
			assert.equal(get(size), 100);
		});

		it.each([false, true])('reaches the target after a hard set with soft=%s', async (soft) => {
			raf.reset();
			const size = spring(0);

			size.set(100);
			raf.tick(16);
			assert.isAbove(get(size), 0);
			assert.isBelow(get(size), 100);

			await size.set(10, { hard: true });
			assert.equal(get(size), 10);

			const completed_value = size.set(20, { soft }).then(() => get(size));

			for (let time = 32; time <= 10000; time += 16) {
				raf.tick(time);
				await Promise.resolve();
			}

			assert.deepEqual(
				{ value: get(size), completed_value: await completed_value },
				{ value: 20, completed_value: 20 }
			);
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
