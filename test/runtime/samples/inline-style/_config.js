export default {
	html: `
		<div style="color: red;"></div>
	`,

	test({ assert, target, window }) {
		const div = target.querySelector('div');

		const styles = window.getComputedStyle(div);
		assert.equal(styles.color, 'red');
	}
};
