import { test } from '../../test';

export default test({
	html: `
		<p style="color: red;"></p>
		<p style="color: red;"></p>
	`,

	test({ assert, component, target, window }) {
		const [p1, p2] = target.querySelectorAll('p');

		assert.equal(window.getComputedStyle(p1).color, 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(p2).color, 'rgb(255, 0, 0)');

		component.color = 'blue';
		assert.htmlEqual(
			target.innerHTML,
			`
			<p style="color: blue;"></p>
			<p style="color: blue;"></p>
		`
		);

		assert.equal(window.getComputedStyle(p1).color, 'rgb(0, 0, 255)');
		assert.equal(window.getComputedStyle(p2).color, 'rgb(0, 0, 255)');
	}
});
