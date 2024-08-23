import { ok, test } from '../../test';

export default test({
	html: `<custom-element class="red svelte-p153w3"></custom-element><custom-element class="red svelte-p153w3"></custom-element>`,

	async test({ assert, target }) {
		const [el, el2] = target.querySelectorAll('custom-element');
		ok(el);
		ok(el2);

		assert.deepEqual(el.className, 'red svelte-p153w3');
		assert.deepEqual(el2.className, 'red svelte-p153w3');
	}
});
