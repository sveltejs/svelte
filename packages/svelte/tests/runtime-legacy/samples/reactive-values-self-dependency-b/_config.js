import { test } from '../../test';

export default test({
	html: `
		<p>count: 0</p>
	`,

	test({ assert, component, target }) {
		component.count = 5;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>count: 5</p>
		`
		);

		component.count = 50;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>count: 9</p>
		`
		);
	}
});
