import { tick } from 'svelte';
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
		d.resolve('hello');
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>hello</h1>');

		d = deferred();
		component.promise = d.promise;
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>hello</h1>');

		d.resolve('hello again');
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>hello again</h1>');
	}
});
