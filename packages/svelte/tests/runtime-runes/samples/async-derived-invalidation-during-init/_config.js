import { flushSync, tick } from 'svelte';
import { deferred } from '../../../../src/internal/shared/utils.js';
import { test } from '../../test';

/** @type {ReturnType<typeof deferred>} */
let d1;

export default test({
	html: `<p>pending</p>`,

	get props() {
		d1 = deferred();

		return {
			promise: d1.promise
		};
	},

	async test({ assert, target, component, errors }) {
		await Promise.resolve();
		var d2 = deferred();
		component.promise = d2.promise;

		d1.resolve('unused');
		await Promise.resolve();
		await Promise.resolve();
		d2.resolve('hello');

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();

		assert.htmlEqual(target.innerHTML, '<p>hello</p>');

		assert.deepEqual(errors, []);
	}
});
