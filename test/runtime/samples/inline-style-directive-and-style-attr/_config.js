export default {
	html: `
		<p style="height: 40px; color: red;"></p>
	`,

	test({ assert, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
		assert.equal(styles.height, '40px');
	}
};
