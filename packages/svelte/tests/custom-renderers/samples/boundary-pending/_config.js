import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {(value: string) => void} */
let resolve;

const promise = new Promise((r) => {
	resolve = r;
});

export default test({
	props: { promise },
	compileOptions: {
		experimental: {
			async: true
		}
	},
	html: '<p>loading...</p> <p>Something outside</p>',
	async test({ assert, target, serialize }) {
		resolve('hello');

		// wait enough microtasks for the async chain to fully resolve:
		// promise.then(() => Promise.resolve()).finally(() => decrement_pending())
		await new Promise((r) => setTimeout(r, 0));
		flushSync();

		const html = serialize(target);
		assert.equal(html, '<p>hello</p> <p>Something inside</p> <p>Something outside</p>');
	}
});
