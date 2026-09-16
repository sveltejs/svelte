import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		assert.equal(target.querySelector('img')?.dataset.pageDocument, 'true');
	}
});
