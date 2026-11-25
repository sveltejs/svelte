import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		const [, element] = /** @type {NodeListOf<HTMLElement & { object?: { test: true } }>} */ (
			target.querySelectorAll('late-element')
		);

		assert.equal(element.hasAttribute('object'), false);
		assert.deepEqual(element.object, { test: true });
	}
});
