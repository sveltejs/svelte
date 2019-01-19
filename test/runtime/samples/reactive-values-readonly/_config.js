export default {
	html: `
		<p>doubled: 2</p>
	`,

	test({ assert, component, target }) {
		component.a = 2;

		assert.equal(component.doubled, 4);
		assert.htmlEqual(target.innerHTML, `
			<p>doubled: 4</p>
		`);

		component.doubled = 6;

		assert.equal(component.doubled, 4);
		assert.htmlEqual(target.innerHTML, `
			<p>doubled: 4</p>
		`);
	}
};
