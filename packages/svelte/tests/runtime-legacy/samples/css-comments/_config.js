import { ok, test } from '../../test';

// JSDOM makes this test pass when it should fail. weird
export default test({
	test({ assert, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		assert.equal(window.getComputedStyle(p).color, 'rgb(255, 0, 0)');
	}
});
