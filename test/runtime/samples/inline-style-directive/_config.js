export default {
	html: `
		<div>
			<p style="color: red;"></p>
		</div>
	`,

	test({ assert, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
	}
};
