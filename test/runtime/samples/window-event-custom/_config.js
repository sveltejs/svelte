export default {
	html: `<p>escaped: false</p>`,

	test(assert, component, target, window) {
		const event = new window.KeyboardEvent('keydown', {
			which: 27
		});

		window.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<p>escaped: true</p>
		`);
	},
};
