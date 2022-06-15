export default {
	html: `
		<p style="height: 40px; color: red;"></p>
	`,
	solo: true,

	test({ assert, target, window, component }) {
		const p = target.querySelector("p");
		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, "red");
		assert.equal(styles.height, "40px");

		component.color2 = "yellow";
		{
			const p = target.querySelector("p");
			const styles = window.getComputedStyle(p);
			assert.equal(styles.color, "red");
		}
	},
};
