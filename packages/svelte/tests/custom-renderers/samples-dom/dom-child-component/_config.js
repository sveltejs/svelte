import { test } from '../../test-dom.test';

export default test({
	// this is the custom rendered component...it doesn't have anything inside because the part of the renderer
	// responsible for the interleaving is the `before` function on the comment node which only push into `dom_elements` in this case
	html: '<custom></custom>',
	test({ assert, dom_elements }) {
		// we then get the element out of dom_elements
		const [div] = dom_elements;
		// check that is an actual DOM element and that it has the expected content
		assert.instanceOf(div, HTMLDivElement);
		assert.equal(div.outerHTML, '<div><span>hello from child</span></div>');
	}
});
