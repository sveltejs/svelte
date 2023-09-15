export default {
	html: `
		<button>Switch</button>
		<p>Another first line</p>
		<p>This line should be last.</p>
	`,
	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const click_event = new window.MouseEvent('click');

		await btn.dispatchEvent(click_event);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>First line</p>
				<p>This line should be last.</p>
			`
		);

		await btn.dispatchEvent(click_event);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>Another first line</p>
				<p>This line should be last.</p>
			`
		);
	}
};
