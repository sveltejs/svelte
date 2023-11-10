import { test } from '../../test';

export default test({
	props: {
		foo: true
	},

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	}
});
