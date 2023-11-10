import { test } from '../../test';

export default test({
	html: `
		<p>1</p>
		<p>2</p>

		<p>1 0</p>
		<p>2 1</p>

		<p>1 0</p>
		<p>2 1</p>
	`,

	test({ assert, component, target }) {
		component.numbers = new Set([2, 3]);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>2</p>
			<p>3</p>

			<p>2 0</p>
			<p>3 1</p>

			<p>2 0</p>
			<p>3 1</p>
		`
		);
	}
});
