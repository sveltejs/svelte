import { flushSync, tick } from 'svelte';
import { deferred } from '../../../../src/internal/shared/utils.js';
import { test } from '../../test';

/** @type {ReturnType<typeof deferred>} */
let d;

export default test({
	html: `<p>pending</p>`,

	get props() {
		d = deferred();

		return {
			promise: d.promise
		};
	},

	async test({ assert, target, component }) {
		d.resolve('h1');
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<h1>hello</h1>');

		component.promise = (d = deferred()).promise;
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>hello</h1>');

		d.resolve('h2');
		await tick();
		assert.htmlEqual(target.innerHTML, '<h2>hello</h2>');
	}
});
