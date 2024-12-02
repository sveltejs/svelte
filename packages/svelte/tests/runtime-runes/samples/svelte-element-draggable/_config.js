import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<div draggable="false"></div><div draggable="false"></div>`,

	async test({ assert, target, logs }) {
		const [div, div2] = target.querySelectorAll('div');
		ok(div);
		ok(div2);

		assert.deepEqual(div.getAttribute('draggable'), 'false');
		assert.deepEqual(div.draggable, false);
		assert.deepEqual(div2.getAttribute('draggable'), 'false');
		assert.deepEqual(div2.draggable, false);
	}
});
