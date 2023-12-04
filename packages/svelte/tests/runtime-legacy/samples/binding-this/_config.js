import { test } from '../../test';

export default test({
	html: '<canvas></canvas>',

	test({ assert, component, target }) {
		const canvas = target.querySelector('canvas');
		assert.equal(canvas, component.foo);
	}
});
