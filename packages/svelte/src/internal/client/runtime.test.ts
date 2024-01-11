import { describe, expect, it } from 'vitest';
import { thunkspread } from '..';

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
