import { test } from '../../test';

export default test({
	props: {
		raw: '<p>this is some html</p> <p>and so is this</p>'
	},

	snapshot(target) {
		const ps = target.querySelectorAll('p');

		return {
			p0: ps[0],
			text0: ps[0].firstChild,
			p1: ps[1],
			text1: ps[1].firstChild
		};
	}
});
