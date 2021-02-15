export default {
	html: `
		<p style="color: green; transform: translateX(45px);"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'green');
		assert.equal(styles.transform, 'translateX(45px)');
	}
};
