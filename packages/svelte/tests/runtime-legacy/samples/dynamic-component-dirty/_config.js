import { test } from '../../test';

/** @type {string[]} */
const calls = [];

export default test({
	get props() {
		return { calls };
	},

	before_test() {
		calls.length = 0;
	},

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');

		assert.deepEqual(calls.length, 1);

		const event = new window.MouseEvent('click', { bubbles: true });
		await button?.dispatchEvent(event);

		assert.deepEqual(calls.length, 1);

		component.current_path = 'bar';
		assert.deepEqual(calls.length, 2);
	}
});
