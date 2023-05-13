export default {
	html: `
		<p>nothing</p>
		<p>after</p>
	`,

	test({ assert, component, target }) {
		component.visible = false;
		assert.htmlEqual(target.innerHTML, '');

		component.visible = true;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>nothing</p>
			<p>after</p>
		`
		);
	}
};
