import { ok, test } from '../../test';

export default test({
	html: `
		<p id="my-id" style="width: 65px; color: blue;"></p>
	`,

	test({ assert, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'rgb(0, 0, 255)');
		assert.equal(styles.width, '65px');
		assert.equal(p.id, 'my-id');
	}
});
