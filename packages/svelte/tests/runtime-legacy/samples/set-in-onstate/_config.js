import { test } from '../../test';

export default test({
	html: `
		<p>1</p>
		<p>2</p>
	`,

	test({ assert, component, target }) {
		component.foo = 2;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>2</p>
			<p>4</p>
		`
		);
	}
});
