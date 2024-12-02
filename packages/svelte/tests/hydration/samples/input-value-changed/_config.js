import { test } from '../../test';

export default test({
	server_props: {
		name: 'server'
	},

	props: {
		name: 'browser'
	},

	test(assert, target) {
		const input = target.querySelector('input');
		assert.equal(input?.value, 'browser');
	}
});
