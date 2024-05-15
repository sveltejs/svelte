import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<div title="&amp;<">blah</div>');
	}
});
