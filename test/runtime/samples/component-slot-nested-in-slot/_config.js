export default {
	html: `
		<p slot='one'>one: 1 two: 2</p>
	`,
	test({ assert, component, target }) {
		component.a = 3;
		component.b = 4;
		assert.htmlEqual(target.innerHTML, `
			<p slot='one'>one: 3 two: 4</p>
		`);

		component.a = 5;
		component.b = 6;
		assert.htmlEqual(target.innerHTML, `
			<p slot='one'>one: 5 two: 6</p>
		`);
	}
};
