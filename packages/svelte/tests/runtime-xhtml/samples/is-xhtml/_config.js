import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `<div>div</div>`);
	}
});
