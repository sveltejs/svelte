import { assert_ok, test } from '../../assert';

export default test({
	html: `
		<p style="font-size: 32px; color: red; background-color: green; border-color: green;"></p>
	`,

	test({ assert, target, window, component }) {
		const p = target.querySelector('p');
		assert_ok(p);
		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'rgb(255, 0, 0)');
		assert.equal(styles.fontSize, '32px');
		assert.equal(styles.backgroundColor, 'rgb(0, 128, 0)');
		assert.equal(styles.borderColor, 'rgb(0, 128, 0)');

		component.foo = 'font-size: 50px; color: green;'; // Update style attribute
		{
			const p = target.querySelector('p');
			assert_ok(p);
			const styles = window.getComputedStyle(p);
			assert.equal(styles.color, 'rgb(255, 0, 0)');
			assert.equal(styles.fontSize, '32px');
			assert.equal(styles.backgroundColor, 'rgb(0, 128, 0)');
			assert.equal(styles.borderColor, 'rgb(0, 128, 0)');
		}
	}
});
