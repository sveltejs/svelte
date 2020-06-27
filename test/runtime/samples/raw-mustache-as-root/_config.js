export default {
	html: `
		<button>Switch</button>
		<p>Another first line</p>
		<p>This line should be last.</p>
	`,
	async test({ assert, target, window }) {
		const btn = target.querySelector("button");
		const clickEvent = new window.MouseEvent("click");

		await btn.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>First line</p>
				<p>This line should be last.</p>
			`
		);

		await btn.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>Another first line</p>
				<p>This line should be last.</p>
			`
		);
	},
};
