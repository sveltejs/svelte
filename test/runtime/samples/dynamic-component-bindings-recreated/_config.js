export default {
	props: {
		x: true,
		foo: 'one'
	},

	html: `
		<p>green one</p>
	`,

	test(assert, component, target) {
		component.x = false;

		assert.htmlEqual(target.innerHTML, `
			<p>red one</p>
		`);

		component.x = true;
		component.foo = 'two';

		assert.htmlEqual(target.innerHTML, `
			<p>green two</p>
		`);
	}
};