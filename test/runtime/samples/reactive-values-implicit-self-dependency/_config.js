export default {
	show: 1,
	html: `
		<p>1 / 1</p>
	`,

	test({ assert, component, target }) {
		component.num = 3;

		assert.htmlEqual(target.innerHTML, `
			<p>3 / 3</p>
		`);

		component.num = 2;

		assert.htmlEqual(target.innerHTML, `
			<p>2 / 3</p>
		`);
	}
};
