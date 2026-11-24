import { flushSync } from 'svelte';
import { test } from '../../test';

const html = (/** @type {string} */ style) =>
	`<button>change</button> <button>remove</button> <svelte-css-wrapper style="${style}"><p>hello</p></svelte-css-wrapper>`;

export default test({
	html: html('display: contents; --color: red; --size: 2px;'),
	test({ assert, target, serialize, dispatch_event }) {
		const [change, remove] = target.children.filter(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);

		dispatch_event(change, 'click');
		flushSync();
		assert.equal(serialize(target), html('display: contents; --color: blue; --size: 2px;'));

		dispatch_event(remove, 'click');
		flushSync();
		assert.equal(serialize(target), html('display: contents; --size: 2px;'));
	}
});
