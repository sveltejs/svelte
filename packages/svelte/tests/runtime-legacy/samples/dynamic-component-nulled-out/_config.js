import { test } from '../../test';

export default test({
	html: `
		<p>Foo</p>
	`,

	test({ assert, component, target }) {
		const Bar = component.Bar;

		component.Bar = null;

		assert.htmlEqual(target.innerHTML, '');

		component.Bar = Bar;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Foo</p>
		`
		);
	}
});
