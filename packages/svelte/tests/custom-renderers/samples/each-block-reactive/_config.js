import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>add item</button> <ul><li>a</li><li>b</li><li>c</li></ul>',
	test({ assert, target, serialize, dispatch_event }) {
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		assert.ok(button);

		dispatch_event(button, 'click');
		flushSync();

		const html = serialize(target);
		assert.equal(
			html,
			'<button>add item</button> <ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>'
		);
	}
});
