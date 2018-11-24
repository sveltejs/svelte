export default {
	props: {
		ones: [{ text: '1' }],
		twos: [{ text: '2' }],
	},

	html: `
		<div>1</div>
		<div>2</div>
	`,

	test({ assert, component, target }) {
		component.ones = [{ text: '11' }];

		assert.htmlEqual(target.innerHTML, `
			<div>11</div>
			<div>2</div>
		`);
	},
};
