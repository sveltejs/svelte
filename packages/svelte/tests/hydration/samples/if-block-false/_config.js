import { test } from '../../test';

export default test({
	props: {
		foo: false
	},

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	}
});
