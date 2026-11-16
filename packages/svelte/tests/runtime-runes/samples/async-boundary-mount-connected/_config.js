import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<div>loaded</div>');
		assert.deepEqual(logs, ['mount', true, 'effect', true]);
	}
});
