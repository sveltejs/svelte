import { test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const [control, test] = target.querySelectorAll('p');

		assert.equal(window.getComputedStyle(control).color, '');
		assert.equal(window.getComputedStyle(test).color, 'rgb(255, 0, 0)');
	}
});
