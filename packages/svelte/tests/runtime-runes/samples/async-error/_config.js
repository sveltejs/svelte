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
		d.reject(new Error('oops!'));
		await Promise.resolve();
		await Promise.resolve();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>oops!</p><button>reset</button>');

		const button = target.querySelector('button');

		component.promise = (d = deferred()).promise;
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, '<p>pending</p>');

		d.resolve('wheee');
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>wheee</h1>');
	}
});
