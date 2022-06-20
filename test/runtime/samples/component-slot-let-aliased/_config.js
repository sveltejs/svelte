export default {
	props: {
		things: [1, 2, 3]
	},

	html: `
		<div>
			<span>1</span>
			<span>2</span>
			<span>3</span>
		</div>`,

	test({ assert, component, target }) {
		component.things = [1, 2, 3, 4];
		assert.htmlEqual(target.innerHTML, `
			<div>
				<span>1</span>
				<span>2</span>
				<span>3</span>
				<span>4</span>
			</div>
		`);
	}
};
