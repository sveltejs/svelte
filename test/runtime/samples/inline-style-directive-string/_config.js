export default {
	html: `
		<p style="color: red;"></p>
	`,

	test({ assert, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
	}
};
