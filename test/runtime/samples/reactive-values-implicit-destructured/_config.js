export default {
	props: {
		coords: [0, 0]
	},

	html: `
		<p>0,0</p>
	`,

	test({ assert, component, target }) {
		component.coords = [1, 2];
		assert.htmlEqual(target.innerHTML, `
			<p>1,2</p>
		`);
	}
};
