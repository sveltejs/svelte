import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		// a line feed entity in an attribute value stays a line feed...
		assert.equal(target.querySelector('#attr')?.getAttribute('title'), 'A\nB');
		assert.equal(target.querySelector('#attr-decimal')?.getAttribute('title'), 'A\nB');

		// ...including when the attribute is a prop passed to a component
		assert.equal(target.querySelector('#prop')?.textContent, 'A\nB');

		// other entities in attribute values still decode
		assert.equal(target.querySelector('#attr-other-entity')?.getAttribute('title'), '©');
	}
});
