import { test } from '../../test';

export default test({
	server_props: {
		name: 'server'
	},

	props: {
		name: 'browser'
	},

	snapshot(target) {
		const input = target.querySelector('input');

		return {
			value: input?.value
		};
	}
});
