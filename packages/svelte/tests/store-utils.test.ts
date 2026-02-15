import { describe, it, expect, vi } from 'vitest';
import { subscribe_to_store } from '../src/store/utils.js';

describe('subscribe_to_store', () => {
	it('supports RxJS-style stores with .unsubscribe() method', () => {
		const unsubscribeSpy = vi.fn();
		const store = {
			subscribe: (run: (val: any) => void) => {
				run('initial');
				return {
					unsubscribe: unsubscribeSpy
				};
			}
		};

		const cleanup = subscribe_to_store(store, () => {});
		expect(typeof cleanup).toBe('function');

		cleanup();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('supports function-returning stores (Svelte style)', () => {
		const unsubscribeSpy = vi.fn();
		const store = {
			subscribe: (run: (val: any) => void) => {
				run('initial');
				return unsubscribeSpy;
			}
		};

		const cleanup = subscribe_to_store(store, () => {});
		cleanup();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});
});
