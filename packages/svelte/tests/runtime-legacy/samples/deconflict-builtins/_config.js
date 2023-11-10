import { test } from '../../test';

export default test({
	html: '<span>got</span>',

	test({ assert, component }) {
		assert.equal(component.foo, 'got');
	}
});
