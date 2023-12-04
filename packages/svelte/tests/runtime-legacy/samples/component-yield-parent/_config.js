import { test } from '../../test';

export default test({
	html: `
		<div><p>Hello</p></div>
	`,

	test({ assert, component, target }) {
		assert.equal(component.data, 'Hello');

		component.data = 'World';
		assert.equal(component.data, 'World');
		assert.htmlEqual(
			target.innerHTML,
			`
			<div><p>World</p></div>
		`
		);
	}
});
