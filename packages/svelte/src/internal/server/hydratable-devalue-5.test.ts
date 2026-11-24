import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { Renderer } from './renderer.js';
import type { Component } from 'svelte';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';
import { hydratable } from './hydratable.js';

vi.mock('devalue', async (original) => {
	const devalue = await original<typeof import('devalue')>();

	/** devalue 5 passed `uneval` to the replacer and inlined the string it returned */
	function uneval(value: unknown, replacer?: (value: unknown, uneval: any) => string | void) {
		return devalue.uneval(value, (thing, js) => {
			const str = replacer?.(thing, (v: unknown) => uneval(v, replacer));
			if (typeof str === 'string') return js(Object.assign([str], { raw: [str] }));
		});
	}

	return { ...devalue, uneval };
});

beforeAll(() => {
	enable_async_mode_flag();
});

afterAll(() => {
	disable_async_mode_flag();
});

test('serializes hydratable promise values when devalue 5 is resolved', async () => {
	const component = (renderer: Renderer) => {
		hydratable('key', () => Promise.resolve('value'));
		renderer.child(async () => {
			await Promise.resolve();
		});
		renderer.push('ok');
	};

	const { head } = await Renderer.render(component as unknown as Component);

	expect(head).toMatch(/\[\s*"key"\s*,\s*r\("value"\)\s*\]/);
});
