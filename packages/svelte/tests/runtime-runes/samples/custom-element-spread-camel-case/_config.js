import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		const element = /** @type {HTMLElement & { __camel_case: { test: true } }} */ (
			target.querySelector('camel-case-element')
		);

		assert.equal(element.hasAttribute('camelcase'), false);
		assert.deepEqual(element.__camel_case, { test: true });
	}
});
