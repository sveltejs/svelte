export default {
	get props() {
		return { x: 42 };
	},

	html: `
		<p>42 42</p>
	`,

	test({ assert, component, target }) {
		component.x = 43;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>43 43</p>
		`
		);
	}
};
