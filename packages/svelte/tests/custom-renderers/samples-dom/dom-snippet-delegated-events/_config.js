import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	// DOM -> custom -> DOM: the button belongs to a DOM snippet rendered by a custom
	// component, so it ends up in a DOM container that is outside the mount target
	target: 'dom',
	html: '<custom-root><scene><dom-host><button>0</button></dom-host></scene></custom-root>',
	test({ assert, target, serialize_dom }) {
		const custom_root = /** @type {any} */ (target.querySelector('custom-root'));
		const container = custom_root.__custom.children
			.find((/** @type {any} */ n) => n.name === 'scene')
			.children.find((/** @type {any} */ n) => n.name === 'dom-host').dom;
		const button = container.querySelector('button');

		button.click();
		flushSync();

		assert.equal(
			serialize_dom(target),
			'<custom-root><scene><dom-host><button>1</button></dom-host></scene></custom-root>'
		);
	}
});
