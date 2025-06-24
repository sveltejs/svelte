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

	async test({ assert, target }) {
		d.resolve('hello');
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hello</p>');
	}
});
