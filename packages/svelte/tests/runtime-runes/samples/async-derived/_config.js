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

	async test({ assert, target, component, logs }) {
		d.resolve(42);
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>42</p>');

		component.num = 2;
		await Promise.resolve();
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
		await Promise.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>86</p>');

		assert.deepEqual(logs, [
			'outside boundary 1',
			'$effect.pre 42 1',
			'template 42 1',
			'$effect 42 1',
			'outside boundary 2',
			'$effect.pre 84 2',
			'template 84 2',
			'$effect 84 2',
			'$effect.pre 86 2',
			'template 86 2',
			'$effect 86 2'
		]);
	}
});
