import { test } from '../../test';

export default test({
	server_props: {
		id: 'foo'
	},

	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div
		};
	}
});
