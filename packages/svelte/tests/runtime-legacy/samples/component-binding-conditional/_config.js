import { test } from '../../test';

export default test({
	html: `
		<p>y: bar</p>
		<p>y: bar</p>
	`,

	test({ assert, component, target }) {
		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>y: bar</p>
			<p>y: bar</p>
		`
		);
	}
});
