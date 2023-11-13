import { test } from '../../test';

export default test({
	html: `
		<p>1 + 2 = 3</p>
		<p>3 * 3 = 9</p>
	`,

	test({ assert, component, target }) {
		component.a = 3;
		assert.equal(component.c, 5);
		assert.equal(component.cSquared, 25);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>3 + 2 = 5</p>
			<p>5 * 5 = 25</p>
		`
		);
	}
});
