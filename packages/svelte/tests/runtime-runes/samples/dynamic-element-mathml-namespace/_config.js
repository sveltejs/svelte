import { test } from '../../test';

export default test({
	html: `<math><mi>x</mi></math>`,
	test({ assert, target }) {
		const mi = /** @type {Element} */ (target.querySelector('mi'));

		assert.equal(mi.namespaceURI, 'http://www.w3.org/1998/Math/MathML');
	}
});
