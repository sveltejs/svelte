import { ok, test } from '../../test';

export default test({
	get props() {
		return { foo: 42 };
	},

	html: `
		<button>click me</button>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });

		/** @type {number[]} */
		const messages = [];

		const log = console.log;
		console.log = (msg) => messages.push(msg);
		button.dispatchEvent(event);
		console.log = log;

		assert.deepEqual(messages, [42]);
	}
});
