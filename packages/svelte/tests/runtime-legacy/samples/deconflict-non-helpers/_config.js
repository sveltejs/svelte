import { test } from '../../test';

export default test({
	html: 'ABCD',

	test({ assert, component }) {
		assert.equal(component.compute(), 'ABCD');
	}
});
