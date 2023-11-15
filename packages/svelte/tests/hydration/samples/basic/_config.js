import { test } from '../../test';

export default test({
	snapshot(target) {
		const h1 = target.querySelector('h1');

		return {
			h1,
			text: h1?.childNodes[0]
		};
	}
});
