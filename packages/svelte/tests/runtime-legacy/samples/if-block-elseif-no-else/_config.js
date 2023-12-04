import { test } from '../../test';

export default test({
	get props() {
		return { x: 11 };
	},

	html: `
		<p>x is greater than 10</p>
	`,

	test({ assert, component, target }) {
		component.x = 4;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>x is less than 5</p>
		`
		);

		component.x = 6;
		assert.htmlEqual(target.innerHTML, '');
	}
});
