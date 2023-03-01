const calls = [];
export default {
	props: {
		calls
	},

	before_test() {
		calls.length = 0;
	},

	async test({ assert, component, target, window }) {
		const buttons = target.querySelector('button');

		assert.deepEqual(calls.length, 1);

		const event = new window.MouseEvent('click');
		await buttons.dispatchEvent(event);

		assert.deepEqual(calls.length, 1);

		component.current_path = 'bar';
		assert.deepEqual(calls.length, 2);
	}
};
