import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [start, open, update, hide, reveal, resolve, finish] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>0</p><p>0</p>');

		start.click();
		await tick();
		open.click();
		await tick();
		update.click();
		await tick();
		assert.deepEqual(logs, [1, 2]);

		// The replacement is ready, but the creator has not supplied its first value.
		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><p>0</p>');

		// Skipping the branch lets its batches merge. The buffered result now belongs to
		// the creator too, and must be released without fetching again or resolving load(1).
		hide.click();
		await tick();
		reveal.click();
		await tick();
		finish.click();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>5</p><p>1</p><span>2</span>');
		await settled();
		assert.deepEqual(logs, [1, 2]);
	}
});
