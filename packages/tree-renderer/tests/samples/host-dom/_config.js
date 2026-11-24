import { connections } from '../../renderer';
import { test } from '../../suite';

export default test({
	// DOM content inside the tree is rendered into a `<div>`, held by a `<dom-host>` element
	html: '<view><dom-host></dom-host></view>',
	test({ assert, platform_root }) {
		const view = /** @type {import('../../platform').PElement} */ (platform_root.children[0]);
		const host = /** @type {import('../../platform').PElement} */ (view.children[0]);
		assert.equal(host.dom?.innerHTML, '<p>from the DOM</p>');
		assert.equal(connections.open, 1);
	}
});
