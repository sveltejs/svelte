export default {
	html: `
	<p style="color: red; width: 65px; font-weight: 700;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
	},

	skip_if_ssr: true
	// SSR renders "null" string for null values:
	// <p style="color: red; width: 65px; position: null; font-weight: 700;"></p>
};
