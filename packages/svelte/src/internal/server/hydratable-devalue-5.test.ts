import { expect, test, vi } from 'vitest';
import { Renderer } from './renderer.js';
import { enable_async_mode_flag } from '../flags/index.js';
import { hydratable } from './hydratable.js';

vi.mock('devalue', () => ({
	/** devalue 5 passes a function that returns a string and expects a string back */
	uneval: (value: unknown, replacer?: (value: unknown, uneval: () => string) => unknown) =>
		replacer?.(value, () => '') ?? JSON.stringify(value)
}));

test('serializes hydratable promises when devalue 5 is resolved', async () => {
	enable_async_mode_flag();

	const { head } = await Renderer.render(() => {
		hydratable('key', () => Promise.resolve('value'));
	});

	expect(head).toContain('["key",r("value")]');
});
