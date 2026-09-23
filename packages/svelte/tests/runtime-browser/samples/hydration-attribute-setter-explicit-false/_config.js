import { flushSync } from 'svelte';
import { assert_ok, test } from '../../assert';

export default test({
	mode: ['hydrate'],

	// the server omits the attributes, the client sets them explicitly to `false`
	server_props: {},
	props: { translate: false, draggable: false },

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		const a = target.querySelector('a');
		assert_ok(div);
		assert_ok(a);

		// the inherited/default values already equal `false`, but the explicit values must still be set
		assert.equal(div.getAttribute('translate'), 'no');
		assert.equal(a.getAttribute('draggable'), 'false');

		flushSync(() => {
			component.parent = 'yes';
			component.href = '#top';
		});

		assert.equal(div.translate, false);
		assert.equal(a.draggable, false);
	}
});
