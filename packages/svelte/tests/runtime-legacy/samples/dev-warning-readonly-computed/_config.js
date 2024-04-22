import { test } from '../../test';

export default test({
	skip: true, // TODO: needs fixing, error message is wrong

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
			assert.equal(err.message, "<Main>: Cannot set read-only property 'foo'");
		}
	}
});
