export default {
	html: `
		<button>click me</button>
		<button>click me</button>

		<p>{"value":"0:0"}</p>
		<p></p>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelectorAll('button')[1];

		await button.dispatchEvent(new window.Event('click'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click me</button>
			<button>click me</button>

			<p>{"value":"0:0"}</p>
			<p>{"value":"1:0"}</p>
		`
		);
	}
};
