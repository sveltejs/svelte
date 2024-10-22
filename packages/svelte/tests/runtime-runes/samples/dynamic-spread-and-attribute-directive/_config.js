import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	test({ target, logs, assert }) {
		const input = target.querySelector('input');

		ok(input);

		assert.deepEqual(logs, ['get_rest']);

		assert.ok(input.classList.contains('dark'));
		assert.equal(input.dataset.rest, 'true');

		flushSync(() => {
			input.focus();
		});

		assert.ok(input.classList.contains('dark'));
		assert.ok(input.classList.contains('focused'));
		assert.equal(input.dataset.rest, 'true');

		assert.deepEqual(logs, ['get_rest']);
	}
});
