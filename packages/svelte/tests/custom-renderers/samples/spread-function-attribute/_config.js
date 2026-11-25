import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const div = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'div'
		);
		assert.ok(div);
		assert.equal(div.attributes.id, 'el');

		// a function value that comes through a spread must still reach the renderer
		assert.equal(div.attributes.fn, 'function handler() {}');
	}
});
