export default {
	html: `
	  <button>destroy component</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		const messages = [];
		const log = console.log;
		console.log = msg => messages.push(msg);
		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>destroy component</button>
		`);
		assert.deepEqual(messages, ['destroy']);
		console.log = log;
	}
};
