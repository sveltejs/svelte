import { test } from '../../test';

export default test({
	test({ assert, target, serialize, utils }) {
		const html = serialize(target);
		assert.equal(
			html,
			'<div class="container" data-color="red"><span id="label">colored</span></div>'
		);

		// Verify individual attribute access on the object node
		const div = target.children.find(utils.filter_elements((n) => n.name === 'div'));
		assert.ok(div);
		assert.equal(div?.attributes['class'], 'container');
		assert.equal(div?.attributes['data-color'], 'red');

		const span = div?.children.find(utils.filter_elements((n) => n.name === 'span'));
		assert.ok(span);
		assert.equal(span?.attributes['id'], 'label');
	}
});
