import { test } from '../../test';

export default test({
	server_props: {},

	props: {
		className: 'bar'
	},

	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div
		};
	}
});
