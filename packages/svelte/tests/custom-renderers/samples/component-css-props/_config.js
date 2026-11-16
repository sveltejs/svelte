import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>change</button> <svelte-css-wrapper style="display: contents; --color: red"><p>hello</p></svelte-css-wrapper>',
	test({ assert, target, serialize, dispatch_event }) {
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		assert.ok(button);

		dispatch_event(button, 'click');
		flushSync();

		assert.equal(
			serialize(target),
			'<button>change</button> <svelte-css-wrapper style="display: contents; --color: blue"><p>hello</p></svelte-css-wrapper>'
		);
	}
});
