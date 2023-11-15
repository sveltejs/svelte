import { test } from '../../test';

export default test({
	html: `
		<b>Hello</b>
	`,

	test({ assert, component, target }) {
		component.name = 'World';
		assert.htmlEqual(
			target.innerHTML,
			`
			<b>Hello</b> World
		`
		);
	}
});
