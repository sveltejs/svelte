import { ok, test } from '../../test';

export default test({
	html: `
		<div style="color: red;"></div>
	`,

	test({ assert, target, window }) {
		const div = target.querySelector('div');
		ok(div);

		const styles = window.getComputedStyle(div);
		assert.equal(styles.color, 'rgb(255, 0, 0)');
	}
});
