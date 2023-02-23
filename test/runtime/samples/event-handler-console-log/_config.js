export default {
	props: {
		foo: 42
	},

	html: `
		<button>click me</button>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		const messages = [];

		const log = console.log;
		console.log = msg => messages.push(msg);
		button.dispatchEvent(event);
		console.log = log;

		assert.deepEqual(messages, [42]);
	}
};
