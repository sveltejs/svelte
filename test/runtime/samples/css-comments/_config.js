// JSDOM makes this test pass when it should fail. weird
export default {
	test({ assert, target, window }) {
		const p = target.querySelector('p');
		assert.equal(window.getComputedStyle(p).color, 'red');
	}
};
