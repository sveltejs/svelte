import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [a, b, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		const resolve_latest = async () => {
			resolve.click();
			await tick();
		};

		assert.htmlEqual(output.innerHTML, '<p>0/0</p><p>0@0 = 0@0</p><p>-1@1 = -1@1</p>');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0</p><p>0@0 = 0@0</p><p>-1@1 = -1@1</p>');

		// A and B compute the same item values and indices, but B can commit without waiting for A.
		await resolve_latest();
		assert.htmlEqual(output.innerHTML, '<p>0/1</p><p>-1@0 = -1@0</p><p>1@1 = 1@1</p>');

		// A rebases on B's commit, changing the value and moving both items back.
		await resolve_latest();
		assert.htmlEqual(output.innerHTML, '<p>1/1</p><p>2@0 = 2@0</p><p>-1@1 = -1@1</p>');

		// A's original requests must not overwrite the committed values.
		await resolve_latest();
		assert.htmlEqual(output.innerHTML, '<p>1/1</p><p>2@0 = 2@0</p><p>-1@1 = -1@1</p>');
	}
});
