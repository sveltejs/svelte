export default {
	html: `
		<div style="background-color: rgb(255, 0, 0);"></div>
	`,

	test({ assert, target, window, component }) {
		const div = target.querySelector('div');
		const styles = window.getComputedStyle(div);
		assert.equal(styles.backgroundColor, 'rgb(255, 0, 0)');

		{
			component.backgroundColor = 128;
			const div = target.querySelector('div');
			const styles = window.getComputedStyle(div);
			assert.equal(styles.backgroundColor, 'rgb(128, 0, 0)');
		}
	}
};
