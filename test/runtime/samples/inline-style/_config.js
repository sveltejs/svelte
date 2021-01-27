export default {
	html: `
		<div style="color: red;"></div>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('div');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
	}
};
