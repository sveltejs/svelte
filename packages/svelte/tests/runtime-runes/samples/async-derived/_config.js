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
			promise: d.promise,
			num: 1
		};
	},

	async test({ assert, target, component }) {
		d.resolve(42);
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>42</p>');

		component.num = 2;
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>84</p>');

		d = deferred();
		component.promise = d.promise;
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>pending</p>');

		d.resolve(43);
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>86</p>');
	}
});
