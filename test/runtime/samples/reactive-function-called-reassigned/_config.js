let value;
let called = 0;
function callback(_value) {
	called++;
	value = _value;
}

export default {
	get props() {
		return { callback };
	},
	before_test() {
		called = 0;
	},
	async test({ assert, target, window }) {
		assert.equal(called, 1);

		const input = target.querySelector('input');

		const event = new window.Event('input');
		input.value = 'h';
		await input.dispatchEvent(event);

		assert.equal(called, 2);
		assert.equal(value.length, 3);
		assert.equal(value[0], 'h');
		assert.equal(value[1], '2');
		assert.equal(value[2], '3');
	}
};
