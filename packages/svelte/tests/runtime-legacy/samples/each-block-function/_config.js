import { test } from '../../test';

export default test({
	html: `
		<p>1, 2, 3</p>
		<p>2, 4, 6</p>
		<p>3, 6, 9</p>
	`,

	test({ assert, component, target }) {
		component.numbers = [4, 5];
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>16, 20</p>
			<p>20, 25</p>
		`
		);
	}
});
