export default {
	skip: 1,

	html: `
		<button>click me</button>
		<button>click me</button>

		<p>{"value":{"x":true}}</p>
		<p></p>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelectorAll('button')[1];

		await button.dispatchEvent(new window.Event('click'));

		assert.htmlEqual(target.innerHTML, `
			<button>click me</button>
			<button>click me</button>

			<p>{"value":{"x":true}}</p>
			<p>{"value":{"x":true}}</p>
		`);
	}
};
