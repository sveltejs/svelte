export default {
	html: `
		<p style="color: red;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
	}
};
