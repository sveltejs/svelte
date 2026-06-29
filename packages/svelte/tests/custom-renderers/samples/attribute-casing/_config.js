import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const elements = target.children.filter((/** @type {any} */ n) => n.type === 'element');

		assert.equal(elements.length, 4);

		// Static camelCase attribute should preserve casing
		const div1 = elements[0];
		assert.equal(div1.name, 'div');
		assert.equal(div1.attributes['dataColor'], 'red');
		// Should NOT have a lowercased version
		assert.equal(div1.attributes['datacolor'], undefined);

		// Dynamic camelCase attribute should preserve casing
		const div2 = elements[1];
		assert.equal(div2.name, 'div');
		assert.equal(div2.attributes['viewBox'], '0 0 100 100');
		// Should NOT have a lowercased version
		assert.equal(div2.attributes['viewbox'], undefined);

		// Static tabIndex should preserve casing
		const span = elements[2];
		assert.equal(span.name, 'span');
		assert.equal(span.attributes['tabIndex'], '0');
		// Should NOT have a lowercased version
		assert.equal(span.attributes['tabindex'], undefined);

		// Spread camelCase attributes should preserve casing
		const p = elements[3];
		assert.equal(p.name, 'p');
		assert.equal(p.attributes['dataValue'], 'spread');
		// Should NOT have a lowercased version
		assert.equal(p.attributes['datavalue'], undefined);
	}
});
