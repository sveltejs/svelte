import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<div draggable="false" spellcheck="false" translate="no"></div><div draggable="false" spellcheck="false" translate="no"></div>`,

	async test({ assert, target, logs }) {
		const [div, div2] = target.querySelectorAll('div');
		ok(div);
		ok(div2);

		assert.deepEqual(div.getAttribute('draggable'), 'false');
		assert.deepEqual(div.draggable, false);
		assert.deepEqual(div2.getAttribute('draggable'), 'false');
		assert.deepEqual(div2.draggable, false);

		assert.deepEqual(div.getAttribute('translate'), 'no');
		assert.deepEqual(div.translate, false);
		assert.deepEqual(div2.getAttribute('translate'), 'no');
		assert.deepEqual(div2.translate, false);

		// for some reason element.spellcheck is undefined instead of
		// false initially it might be a JSDom quirk
		assert.deepEqual(div.getAttribute('spellcheck'), 'false');
		assert.deepEqual(div2.getAttribute('spellcheck'), 'false');
	}
});
