import { ok, test } from '../../test';

export default test({
	html: `
		<p style="height: 40px; color: red;"></p>
	`,

	test({ assert, target, window }) {
		const p = target.querySelector('p');
		ok(p);
		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
		assert.equal(styles.height, '40px');
	}
});
