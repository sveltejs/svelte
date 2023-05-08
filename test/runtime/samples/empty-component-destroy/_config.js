let log;
export default {
	html: `
	  <button>destroy component</button>
	`,

	before_test() {
		log = console.log;
	},
	after_test() {
		console.log = log;
	},

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		const messages = [];
		console.log = (msg) => messages.push(msg);
		await button.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>destroy component</button>
		`
		);
		assert.deepEqual(messages, ['destroy']);
	}
};
