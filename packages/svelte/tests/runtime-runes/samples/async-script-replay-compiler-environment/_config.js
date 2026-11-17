import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, logs, window }) {
		await tick();
		await settled();
		const [bump, direct, ordinary] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		const [input] = target.querySelectorAll('input');
		assert.htmlEqual(output.innerHTML, '1 1 1 0 1 stable');
		assert.equal(logs.length, 1);
		const object = logs[0];

		bump.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '2 2 1 1 2 stable');
		assert.equal(logs.length, 2);
		assert.equal(logs[1], object);

		direct.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '2 3 1 1 2 stable');

		ordinary.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '2 4 1 2 2 stable');
		input.value = '5';
		input.dispatchEvent(new window.Event('input', { bubbles: true }));
		await settled();
		assert.htmlEqual(output.innerHTML, '5 4 1 2 5 stable');
		assert.equal(target.querySelector('output'), output);
		assert.equal(logs.length, 2, 'ordinary updates must not replay initialization');
	}
});
