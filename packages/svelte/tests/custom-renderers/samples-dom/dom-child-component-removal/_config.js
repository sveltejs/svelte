import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	html: '<custom></custom>',
	async test({ assert, component, target }) {
		const [div] = target.children[0].elements_children;
		assert.instanceOf(div, HTMLDivElement);
		assert.equal(div.outerHTML, '<div><span>hello from child</span></div>');

		component.hide();
		flushSync();

		assert.isFalse(target.children[0].elements_children.includes(div));
	}
});
