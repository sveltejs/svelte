import { test } from '../../test';

export default test({
	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p,
			text: p?.childNodes[0]
		};
	}
});
