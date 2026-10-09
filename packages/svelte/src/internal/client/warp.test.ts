import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Warp } from './warp.js';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';

let window: {
	__svelte?: { w?: Map<string, Map<unknown, unknown>>; s?: number; m?: Map<any, any> };
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
	test('changes the values directly', () => {
		const warp = new Warp('test');
		warp.set('c', 3);
		warp.delete('a');

		expect([...base()]).toEqual([
			['b', 2],
			['c', 3]
		]);
	});
});

describe('while streaming', () => {
	beforeEach(() => {
		window.__svelte!.s = 1;
	});

	test('does not change the values the stream writes to', () => {
		const warp = new Warp('test');
		warp.set('a', 10);
		warp.delete('b');
		warp.set('c', 3);

		expect([...base()]).toEqual([
			['a', 1],
			['b', 2]
		]);

		expect(warp.get('a')).toBe(10);
		expect(warp.has('b')).toBe(false);
		expect(warp.size).toBe(2);
		expect([...warp]).toEqual([
			['a', 10],
			['c', 3]
		]);
	});

	test('shows values that arrive later, unless they were changed', () => {
		const warp = new Warp('test');
		warp.set('late', 'client');
		warp.delete('deleted');

		base().set('late', 'server');
		base().set('deleted', 'server');
		base().set('new', 'server');

		expect(warp.get('late')).toBe('client');
		expect(warp.has('deleted')).toBe(false);
		expect(warp.get('new')).toBe('server');
	});

	test('handles setting values after clearing', () => {
		const warp = new Warp('test');
		warp.set('c', 3);
		warp.clear();
		warp.set('b', 20);

		// arrives after the clear, so is hidden by it
		base().set('late', 'server');

		expect(warp.has('a')).toBe(false);
		expect(warp.get('b')).toBe(20);
		expect(warp.has('c')).toBe(false);
		expect(warp.has('late')).toBe(false);
		expect([...warp.keys()]).toEqual(['b']);
	});

	test('keeps the order a Map would have', () => {
		const warp = new Warp('test');
		warp.set('c', 3);
		warp.delete('a');
		warp.set('a', 10);
		warp.set('b', 20);

		const expected = [
			['b', 20],
			['c', 3],
			['a', 10]
		];

		expect([...warp]).toEqual(expected);

		window.__svelte!.s = 0;
		expect([...warp]).toEqual(expected);
		expect([...base()]).toEqual(expected);
	});

	test('getOrInsertComputed uses the overlay', () => {
		const warp = new Warp('test');
		warp.delete('a');

		expect(warp.getOrInsertComputed('a', () => 10)).toBe(10);
		expect(warp.getOrInsertComputed('b', () => 20)).toBe(2);
		expect(base().get('a')).toBe(1);
	});

	test('applies the changes once the stream finishes', () => {
		const warp = new Warp('test');
		warp.clear();
		warp.set('c', 3);

		window.__svelte!.s = 0;

		expect([...warp]).toEqual([['c', 3]]);
		expect([...base()]).toEqual([['c', 3]]);
		expect(window.__svelte!.m!.size).toBe(0);
	});

	test('applies the changes once the document has loaded, even if the stream did not finish', () => {
		const warp = new Warp('test');
		warp.delete('a');

		document.readyState = 'interactive';

		expect(warp.has('a')).toBe(false);
		expect([...base()]).toEqual([['b', 2]]);
	});
});
