import { tick } from 'svelte';
import { deferred } from '../../../../src/internal/shared/utils.js';
import { test } from '../../test';

/** @type {ReturnType<typeof deferred>} */
let d;

export default test({
	compileOptions: {
		dev: true
	},
	html: `<p>pending</p>`,

	get props() {
		d = deferred();

		return {
			promise: d.promise
		};
	},

	async test({ assert, target, component }) {
		d.resolve(['a', 'b', 'c']);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>a</p><p>b</p><p>c</p>');

		d = deferred();
		component.promise = d.promise;
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>a</p><p>b</p><p>c</p>');

		d.resolve(['d', 'e', 'f', 'g']);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>d</p><p>e</p><p>f</p><p>g</p>');

		d = deferred();
		component.promise = d.promise;
		d.resolve(['d', 'e', 'f', 'd']);
		await tick();
		assert.fail('should not allow duplicate keys');
	},

	runtime_error: 'each_key_duplicate'
});
