let log;
export default {
	html: `
	<button>Show/Hide</button><div id="show"><p>Hello</p></div>
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
		console.log = msg => messages.push(msg);
		await button.dispatchEvent(event);
		//This means element gets removed
		assert.htmlEqual(target.innerHTML, `
			<button>Show/Hide</button>
		`);
		//This means element existed on Destroy gets called
		assert.deepEqual(messages, ['Element exist true', 'Custom component destroyed.']);
	}
};
