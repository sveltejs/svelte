import { ok, test } from '../../test';

export default test({
	html: `
		<p style="opacity: 0.5; color: red">color: red</p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		let styles = window.getComputedStyle(p);
		assert.equal(styles.opacity, '0.5');
		assert.equal(styles.color, 'rgb(255, 0, 0)');

		component.styles = 'font-size: 20px';

		styles = window.getComputedStyle(p);
		assert.equal(styles.opacity, '0.5');
		assert.equal(styles.color, '');
		assert.equal(styles.fontSize, '20px');
	}
});
