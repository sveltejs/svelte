export default {
	data: {
		props: {
			disabled: true
		}
	},

	html: `
		<button disabled>click me</button>
	`,

	test(assert, component, target) {
		const button = target.querySelector('button');

		assert.ok(button.disabled);

		component.set({
			props: { disabled: false }
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>click me</button>`
		);
		assert.ok(!button.disabled);
	},
};
