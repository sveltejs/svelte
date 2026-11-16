import { tick } from 'svelte';
import { test } from '../../test';

// The creator commits with its boundary pending. A later attempt can complete
// its script independently, but its unrelated pending work still prevents its
// result from becoming visible. Once it commits, the boundary reveals the newer
// value without waiting for the creator's old result or accepting a late overwrite.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [update, v0, v1, y1] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['v 0']);

		update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['y 1', 'v 1']);

		// The later attempt can continue, but its result is still uncommitted.
		v1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['continued with 1']);

		// the later batch commits, which supersedes the run of the batch that created the component
		y1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p><span>1</span>');
		assert.deepEqual(logs.splice(0), []);

		// (superseded, so this does nothing)
		v0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p><span>1</span>');
		assert.deepEqual(logs.splice(0), []);
	}
});
