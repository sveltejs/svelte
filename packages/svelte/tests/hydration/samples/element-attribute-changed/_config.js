import { test } from '../../test';

export default test({
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
