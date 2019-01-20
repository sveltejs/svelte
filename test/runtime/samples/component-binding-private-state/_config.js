export default {
	html: `
		<p>Foo: yes</p>
		<p>x in parent: undefined</p>
	`,

	async test({ assert, component, target, window }) {
		component.a = false;

		assert.htmlEqual(target.innerHTML, `
			<p>Bar: no</p>
			<p>x in parent: undefined</p>
		`);

		component.a = true;
		assert.equal(component.x, undefined);
		component.x = 'maybe';

		assert.htmlEqual(target.innerHTML, `
			<p>Foo: yes</p>
			<p>x in parent: maybe</p>
		`);

		component.a = false;

		assert.htmlEqual(target.innerHTML, `
			<p>Bar: no</p>
			<p>x in parent: maybe</p>
		`);
	}
};
