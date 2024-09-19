import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	get props() {
		return { a: 42 };
	},

	test({ assert, component }) {
		try {
			component.foo = 1;
			throw new Error('Expected an error');
		} catch (err) {
			// @ts-ignore
			assert.equal(err.message, 'Cannot set property foo of #<Object> which has only a getter');
		}
	}
});
