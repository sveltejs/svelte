export default {
	html: `<p>escaped: false</p>`,

	async test({ assert, component, target, window }) {
		const event = new window.KeyboardEvent('keydown', {
			which: 27
		});

		await window.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<p>escaped: true</p>
		`);
	},
};
