import { flushSync, tick } from 'svelte';
import { deferred } from '../../../../src/internal/shared/utils.js';
import { test } from '../../test';

/** @type {Array<ReturnType<typeof deferred>>} */
let items = [];

export default test({
	html: `<p>pending</p>`,

	get props() {
		items = [deferred(), deferred(), deferred()];

		return {
			items
		};
	},

	async test({ assert, target, component }) {
		items[0].resolve('a');
		items[1].resolve('b');
		items[2].resolve('c');
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>a</p><p>b</p><p>c</p>');

		items = [deferred(), deferred(), deferred(), deferred()];
		component.items = items;
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>a</p><p>b</p><p>c</p>');

		items[0].resolve('b');
		items[1].resolve('c');
		items[2].resolve('d');
		items[3].resolve('e');
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>b</p><p>c</p><p>d</p><p>e</p>');
	}
});
