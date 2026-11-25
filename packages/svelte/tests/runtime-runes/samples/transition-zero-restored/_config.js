import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		const paragraphs = Array.from(target.querySelectorAll('p'));

		button.click();
		await tick();

		// Abort the out-only completion, and deactivate the bidirectional outro's
		// completion, before either outro can destroy the restored branch.
		assert.deepEqual(Array.from(target.querySelectorAll('p')), paragraphs);
		assert.htmlEqual(output.innerHTML, 'outro start, intro start, intro end');
	}
});
