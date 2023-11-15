import { ok, test } from '../../test';

export default test({
	html: `
		<p style="background-color: green; font-size: 12px;"></p>
	`,

	test({ assert, target, window, component }) {
		const p = target.querySelector('p');
		ok(p);
		const styles = window.getComputedStyle(p);
		assert.equal(styles.backgroundColor, 'green');
		assert.equal(styles.fontSize, '12px');

		{
			component.modify = true;
			const p = target.querySelector('p');
			ok(p);
			const styles = window.getComputedStyle(p);
			assert.equal(styles.backgroundColor, 'green');
			assert.equal(styles.fontSize, '50px');
		}
	}
});
