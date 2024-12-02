import { ok, test } from '../../test';

export default test({
	html: `
		<p style="color: red; width: 65px; font-weight: 700;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		let styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'rgb(255, 0, 0)');

		component.myColor = 'pink';
		component.width = '100vh';
		component.absolute = true;
		component.bold = false;

		styles = window.getComputedStyle(p);
		assert.htmlEqual(
			target.innerHTML,
			'<p style="color: pink; width: 100vh; font-weight: 100; position: absolute;"></p>'
		);
		assert.equal(styles.color, 'rgb(255, 192, 203)');
		assert.equal(styles.width, '100vh');
		assert.equal(styles.fontWeight, '100');
		assert.equal(styles.position, 'absolute');
	}
});
