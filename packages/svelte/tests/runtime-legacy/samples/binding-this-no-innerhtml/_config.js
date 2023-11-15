import { test } from '../../test';

export default test({
	html: '<div><canvas></canvas></div>',

	test({ assert, component, target }) {
		const canvas = target.querySelector('canvas');
		assert.equal(canvas, component.foo);
	}
});
