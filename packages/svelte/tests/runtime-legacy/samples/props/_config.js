import { test } from '../../test';

export default test({
	get props() {
		return { x: 1 };
	},

	html: `
		<p>{"x":1}</p>
	`,

	test({ assert, component, target }) {
		component.x = 2;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>{"x":2}</p>
		`
		);
	}
});
