import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [assign, compute, resolve_d, resolve_gate] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, '<p>0</p><p>0</p>');

		assign.click();
		await tick();
		compute.click();
		await tick();

		// The computed result equals the assigned value, but the pending assignment still
		// establishes ordering. Its batch must not be mistaken for a computed-only writer.
		resolve_d.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><p>0</p>');

		resolve_gate.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p><p>1</p>');

		compute.click();
		await tick();
		resolve_d.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p><p>1</p>');
	}
});
