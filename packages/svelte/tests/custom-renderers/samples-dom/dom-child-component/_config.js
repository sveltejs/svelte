import { test } from '../../test-dom.test';

export default test({
	// the DOM child is rendered into a DOM container, represented in the custom tree by `<dom-host>`
	html: '<custom><dom-host><div><span>hello from child</span></div></dom-host></custom>',
	test({ assert, target }) {
		const [custom] = target.children;
		const div = custom.children[0].dom.querySelector('div');
		assert.instanceOf(div, HTMLDivElement);
	}
});
