import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Warp } from './warp.js';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';

let window: {
	__svelte?: {
		w?: Map<string, Map<unknown, unknown>>;
		s?: number;
		t?: Map<string, Set<unknown> | true>;
	};
};
let document: { readyState: string };

/** the values the stream writes to */
function base() {
	return window.__svelte!.w!.get('test')!;
}

beforeEach(() => {
	enable_async_mode_flag();
	window = {
		__svelte: {
			w: new Map([
				[
					'test',
					new Map([
						['a', 1],
						['b', 2]
					])
				]
			])
		}
	};
	document = { readyState: 'loading' };
	vi.stubGlobal('window', window);
	vi.stubGlobal('document', document);
});

afterEach(() => {
	disable_async_mode_flag();
	vi.unstubAllGlobals();
});

describe('when not streaming', () => {
	test('changes the values directly, without recording them', () => {
		const warp = new Warp('test');
		warp.set('c', 3);
		warp.delete('a');
		warp.getOrInsert('d', 4);
		warp.getOrInsertComputed('e', () => 5);
		warp.clear();

		expect([...base()]).toEqual([]);
		expect(window.__svelte!.t).toBeUndefined();
	});
});

describe('while streaming', () => {
	beforeEach(() => {
		window.__svelte!.s = 1;
	});

	test('changes the values directly, like a Map', () => {
		const warp = new Warp('test');
		warp.set('c', 3);
		warp.delete('a');
		warp.set('a', 10);

		expect([...base()]).toEqual([
			['b', 2],
			['c', 3],
			['a', 10]
		]);
	});

	test('records the keys that were changed', () => {
		const warp = new Warp('test');
		warp.set('a', 10);
		warp.delete('missing');
		warp.getOrInsert('b', 20);
		warp.getOrInsert('c', 3);
		warp.getOrInsertComputed('b', () => 20);
		warp.getOrInsertComputed('d', () => 4);

		// reading, or getOrInsert(Computed) on an existing key, doesn't count as a change
		warp.get('x');
		warp.has('y');

		expect(window.__svelte!.t?.get('test')).toEqual(new Set(['a', 'missing', 'c', 'd']));
	});

	test('does not record the key if getOrInsertComputed throws', () => {
		const warp = new Warp('test');

		expect(() =>
			warp.getOrInsertComputed('c', () => {
				throw new Error('nope');
			})
		).toThrow('nope');

		expect(window.__svelte!.t?.get('test')).toBeUndefined();
	});

	test('records that a Warp was cleared', () => {
		const warp = new Warp('test');
		warp.set('a', 10);
		warp.clear();
		warp.set('b', 20);

		expect(window.__svelte!.t?.get('test')).toBe(true);
		expect([...base()]).toEqual([['b', 20]]);
	});

	test('does not record changes once the document has loaded, even if the stream did not finish', () => {
		document.readyState = 'interactive';

		const warp = new Warp('test');
		warp.set('a', 10);

		expect(window.__svelte!.t).toBeUndefined();
	});
});
