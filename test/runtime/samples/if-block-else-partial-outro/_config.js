export default {
	props: {
		x: 1,
		y: false
	},

	html: `
		<span>1</span>
	`,

	test({ assert, component, target }) {
		component.x = 2;
		assert.htmlEqual(target.innerHTML, `
			<span>2</span>
		`);
	}
};
