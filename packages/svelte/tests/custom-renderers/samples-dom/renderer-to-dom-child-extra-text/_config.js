import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

const content = 'test: <custom-root><div><span>hello from child</span></div></custom-root>';

export default test({
	// the custom child shares its `{#if}` branch with text, so the branch's nodes
	// are a text node followed by the crossing's host node
	target: 'dom',
	html: `<div>${content}</div>`,
	test({ assert, component, target, serialize_dom }) {
		component.hide();
		flushSync();
		assert.equal(serialize_dom(target), '<div></div>');

		component.show();
		flushSync();
		assert.equal(serialize_dom(target), `<div>${content}</div>`);
	}
});
