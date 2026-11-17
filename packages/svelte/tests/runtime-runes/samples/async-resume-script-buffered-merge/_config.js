import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [start, open, update, hide, reveal, resolve_update, finish, resolve_reveal, resolve_old] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>0</p><p>0</p>');

		start.click();
		await tick();
		open.click();
		await tick();
		update.click();
		await tick();
		assert.deepEqual(logs, [1, 2]);

		resolve_update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><p>0</p>');

		// Hide/reveal can retire the unpublished attempt and start a fresh one.
		// This request is independent even though its input is also 2. It must
		// complete without resolving the obsolete load(1) or retrying it.
		hide.click();
		await tick();
		reveal.click();
		await tick();
		finish.click();
		await tick();
		assert.deepEqual(logs, [1, 2, 2]);

		resolve_reveal.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>5</p><p>1</p><span>2</span>');
		await settled();
		assert.deepEqual(logs, [1, 2, 2]);

		resolve_old.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>5</p><p>1</p><span>2</span>');
		assert.deepEqual(logs, [1, 2, 2]);
	}
});
