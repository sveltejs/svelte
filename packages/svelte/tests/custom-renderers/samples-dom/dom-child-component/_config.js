import { test } from '../../test-dom.test';

export default test({
	// this is the custom rendered component...it doesn't have anything inside because the part of the renderer
	// responsible for the interleaving is the `before` function on the comment node which only push into `target.elements_children` in this case
	html: '<custom></custom>',
	test({ assert, target }) {
		// we then get the element out of target.elements_children
		const [div] = target.children[0].elements_children;
		// check that is an actual DOM element and that it has the expected content
		assert.instanceOf(div, HTMLDivElement);
		assert.equal(div.outerHTML, '<div><span>hello from child</span></div>');
	}
});
