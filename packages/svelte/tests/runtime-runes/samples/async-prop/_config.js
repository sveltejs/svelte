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
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hello</p>');

		d = deferred();
		component.promise = d.promise;
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>pending</p>');

		d.resolve('hello again');
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hello again</p>');
	}
});
