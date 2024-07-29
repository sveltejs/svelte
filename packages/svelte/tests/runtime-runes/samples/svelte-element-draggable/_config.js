import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<div draggable="false"></div>`,

	async test({ assert, target, logs }) {
		const div = target.querySelector('div');
		ok(div);

		assert.deepEqual(div.getAttribute('draggable'), 'false');
	}
});
