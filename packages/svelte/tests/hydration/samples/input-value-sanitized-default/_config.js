import { test } from '../../test';

export default test({
	snapshot(target) {
		// simulate the user picking a color before hydration
		const [edited] = target.querySelectorAll('input');
		edited.value = '#00ff00';

		return {};
	},

	test(assert, target) {
		const p = target.querySelector('p');
		assert.equal(p?.textContent, '["#00ff00",null]');
	}
});
