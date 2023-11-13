import { test } from '../../test';

export default test({
	html: `
		<p>Foo: yes</p>
		<p>x in parent: yes</p>
	`,

	async test({ assert, component, target }) {
		component.a = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Bar: yes</p>
			<p>x in parent: yes</p>
		`
		);

		component.a = true;
		assert.equal(component.x, 'yes');
		component.x = undefined;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Foo: </p>
			<p>x in parent: </p>
		`
		);

		component.a = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Bar: no</p>
			<p>x in parent: no</p>
		`
		);
	}
});
