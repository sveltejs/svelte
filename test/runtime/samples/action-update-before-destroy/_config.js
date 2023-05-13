export default {
	html: `
		<button>Click Me</button>
		<div>1</div>
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		const messages = [];
		const log = console.log;
		console.log = (msg) => messages.push(msg);
		await button.dispatchEvent(event);
		console.log = log;
		assert.deepEqual(messages, ['afterUpdate', 'onDestroy']);
	}
};
