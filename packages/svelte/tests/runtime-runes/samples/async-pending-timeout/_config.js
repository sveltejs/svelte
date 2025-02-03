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

	async test({ assert, target, component, raf }) {
		d.resolve('hello');
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<h1>hello</h1>');

		component.promise = (d = deferred()).promise;
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>hello</h1>');

		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '<p>pending</p>');

		d.resolve('wheee');
		await tick();
		raf.tick(600);
		assert.htmlEqual(target.innerHTML, '<p>pending</p>');

		raf.tick(800);
		assert.htmlEqual(target.innerHTML, '<h1>wheee</h1>');
	}
});
