import { describe, expect, it } from 'vitest';
import { proxy_rest_array, thunkspread } from '..';

describe('thunkspread', () => {
	it('makes all of its arguments callable', () => {
		const items = [1, 2, 'three', 4, { five: 5 }];
		const thunks = thunkspread(items);
		expect(thunks.map((thunk) => thunk())).toEqual(items);
	});

	it('works with iterables', () => {
		function* items() {
			for (const item of [1, 2, 'three', 4, { five: 5 }]) {
				yield item;
			}
		}
		const items_iterator = items();
		const thunks = thunkspread(items_iterator);
		expect(thunks.map((thunk) => thunk())).toEqual([...items()]);
	});
});

describe('proxy_rest_array', () => {
	it('calls its items on access', () => {
		const items = [() => 1, () => 2, () => 3];
		const proxied_items = proxy_rest_array(items);
		expect(proxied_items[1]).toBe(2);
	});

	it('returns undefined for keys with no item', () => {
		const items = [() => 1, () => 2, () => 3];
		const proxied_items = proxy_rest_array(items);
		expect(proxied_items[4]).toBe(undefined);
	});

	it('works with array methods', () => {
		const items = [() => 1, () => 2, () => 3];
		const proxied_items = proxy_rest_array(items);
		expect(proxied_items.map((item) => item)).toEqual([1, 2, 3]);
		// @ts-expect-error - This is a weird case for sure
		expect(proxied_items.find((item) => item === 1)).toBe(1);
	});
});
