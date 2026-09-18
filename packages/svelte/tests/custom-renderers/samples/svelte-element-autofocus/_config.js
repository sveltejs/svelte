import { test } from '../../test';

export default test({
	test({ assert, target }) {
		// If we got here, the component mounted without crashing on document.body access.
		// Verify autofocus is set as a regular attribute.
		const input = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'input'
		);
		assert.ok(input, 'input element should exist');
		assert.equal(
			input.attributes['autofocus'],
			'true',
			'autofocus should be set as a regular attribute'
		);
		assert.equal(input.attributes['value'], 'test', 'value should be set as a regular attribute');
	}
});
