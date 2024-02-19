import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, component }) {
		assert.equal(component.bar1, 42);
		assert.equal(component.bar2, 42);
		assert.throws(() => {
			component.bar1 = 100;
		}, /Cannot set property bar1 of .+ which has only a getter/);
		component.bar2 = 100;
		assert.equal(component.bar1, 42);
		assert.equal(component.bar2, 100);
	}
});
