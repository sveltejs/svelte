import { test } from '../../suite';

export default test({
	test({ assert, instance, platform_root }) {
		// attachments get the tree node, which points to the platform's element
		const view = instance.get_view();
		assert.equal(view.type, 'element');
		assert.equal(view.node, platform_root.children[0]);
	}
});
