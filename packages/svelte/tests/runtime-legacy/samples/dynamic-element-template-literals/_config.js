import { test } from '../../test';

export default test({
	get props() {
		return { size: 1 };
	},
	html: '<h1>This is h1 tag</h1>',

	test({ assert, component, target }) {
		const h1 = target.querySelector('h1');
		component.size = 2;

		assert.htmlEqual(
			target.innerHTML,
			`
			<h2>This is h2 tag</h2>
		`
		);

		const h2 = target.querySelector('h2');
		assert.notEqual(h1, h2);
	}
});
