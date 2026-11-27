// @vitest-environment jsdom
import { afterEach, assert, it } from 'vitest';
import { render } from 'svelte/server';
import { raf } from '../../src/internal/client/timing.js';
import { compile_directory } from '../helpers.js';

const directory = `${__dirname}/samples/ssr`;
await compile_directory(directory, 'server');
const Component = (await import(`${directory}/_output/server/main.svelte.js`)).default;

afterEach(() => {
	raf.tasks.clear();
});

it.each(['constructors', 'of', 'set'])(
	'does not retain %s motion tasks during SSR',
	async (mode) => {
		assert.equal(raf.tasks.size, 0);

		for (let value = 1; value <= 3; value += 1) {
			const promises: Promise<void>[] = [];
			const rendered = render(Component, { props: { mode, value, promises } });
			const current = mode === 'set' ? 0 : value;

			assert.equal(
				rendered.body,
				`<!--[--><p>${current} ${value} ${current} ${value} 0 0</p><!--]-->`
			);
			assert.lengthOf(promises, mode === 'set' ? 4 : 0);

			let settled = 0;
			for (const promise of promises) {
				promise.then(
					() => settled++,
					() => settled++
				);
			}
			await Promise.resolve();
			assert.equal(settled, 0);
			assert.equal(raf.tasks.size, 0);
		}
	}
);
