import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, instance, logs }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p><p>0</p>');

		instance.start();
		await tick();
		instance.open();
		await tick();
		instance.update();
		await tick();
		assert.deepEqual(logs, [1, 2]);

		// The replacement is ready, but the creator has not supplied its first value.
		instance.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p><p>0</p>');

		// Skipping the branch lets its batches merge. The buffered result now belongs to
		// the creator too, and must be released without fetching again or resolving load(1).
		instance.hide();
		await tick();
		instance.reveal();
		await tick();
		instance.finish();
		await tick();

		assert.htmlEqual(target.innerHTML, '<p>5</p><p>1</p><span>2</span>');
		await settled();
		assert.deepEqual(logs, [1, 2]);
	}
});
