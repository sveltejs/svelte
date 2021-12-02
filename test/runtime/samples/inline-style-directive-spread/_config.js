export default {
	html: `
		<p id="my-id" style="width: 65px; color: blue;"></p>
	`,

	test({ assert, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'blue');
		assert.equal(styles.width, '65px');
		assert.equal(p.id, 'my-id');
	}
};
