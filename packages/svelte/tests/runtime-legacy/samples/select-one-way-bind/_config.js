import { test } from '../../test';

export default test({
	get props() {
		return { foo: 'a' };
	},

	test({ assert, component, target }) {
		const options = target.querySelectorAll('option');

		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);

		component.foo = 'b';

		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);
	}
});
