import { assert_ok, test } from '../../test';

export default test({
	server_props: {
		items: [{ name: 'x' }]
	},

	props: {
		items: [{ name: 'a' }, { name: 'b' }]
	},

	snapshot(target) {
		const ul = target.querySelector('ul');
		assert_ok(ul);
		const lis = ul.querySelector('li');
		assert_ok(lis);

		return {
			ul,
			lis
		};
	}
});
