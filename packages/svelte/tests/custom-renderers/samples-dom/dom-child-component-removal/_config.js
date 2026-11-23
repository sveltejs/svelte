import { flushSync } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

export default test({
	html: '<custom><dom-host><div>hello</div></dom-host> <after></after></custom>',
	test({ assert, component, target, serialize }) {
		const container = target.children[0].children[0].dom;
		const div = container.querySelector('div');

		component.toggle();
		flushSync();
		assert.equal(serialize(target), '<custom> <after></after></custom>');
		assert.equal(connections.open, 0);
		// the DOM content was removed from its container, not just detached from the custom tree
		assert.equal(div.parentNode, null);
		assert.equal(container.childNodes.length, 0);

		// re-inserted in the right place, before `<after>`
		component.toggle();
		flushSync();
		assert.equal(
			serialize(target),
			'<custom><dom-host><div>hello</div></dom-host> <after></after></custom>'
		);
		assert.equal(connections.open, 1);
	}
});
