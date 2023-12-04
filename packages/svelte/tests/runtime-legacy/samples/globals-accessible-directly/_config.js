import { test } from '../../test';

export default test({
	html: '',

	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, 'NaN');
	}
});
