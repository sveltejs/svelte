import { test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const [control, test] = target.querySelectorAll('p');

		assert.equal(window.getComputedStyle(control).color, '');
		assert.equal(window.getComputedStyle(control).backgroundColor, 'rgba(0, 0, 0, 0)');

		assert.equal(window.getComputedStyle(test).color, 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(test).backgroundColor, 'rgb(0, 0, 0)');
	}
});
