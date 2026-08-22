import { test } from '../../test';

// Regression for #18574: static `value="..."` on `<textarea>` was emitted as a
// meaningless HTML attribute on CSR, so the control stayed empty. Dynamic
// `value={...}` and SSR already worked by setting content / the value property.
export default test({
	test({ assert, target }) {
		const static_attr = /** @type {HTMLTextAreaElement} */ (
			target.querySelector('#static-attr')
		);
		const static_expr = /** @type {HTMLTextAreaElement} */ (
			target.querySelector('#static-expr')
		);
		const dynamic = /** @type {HTMLTextAreaElement} */ (target.querySelector('#dynamic'));
		const children = /** @type {HTMLTextAreaElement} */ (target.querySelector('#children'));
		const leading_nl = /** @type {HTMLTextAreaElement} */ (
			target.querySelector('#leading-nl')
		);
		const escaped = /** @type {HTMLTextAreaElement} */ (target.querySelector('#escaped'));

		assert.equal(static_attr.value, 'hi');
		assert.equal(static_expr.value, 'hi');
		assert.equal(dynamic.value, 'hi');
		assert.equal(children.value, 'hi');
		assert.equal(leading_nl.value, '\nhi');
		assert.equal(escaped.value, 'a<b&c');

		// Static attribute value should also establish defaultValue (form reset).
		assert.equal(static_attr.defaultValue, 'hi');
	}
});
