export default {
	html: `
		<div style="background-image: url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png); --css-variable: rgba(0, 0, 0, 1);"></div>
	`,

	test({ assert, target, window }) {
		const div = target.querySelector('div');
		const styles = window.getComputedStyle(div);

		assert.equal(styles['background-image'], 'url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png)');
		assert.equal(styles.getPropertyValue('--css-variable'), 'rgba(0, 0, 0, 1)');

		assert.htmlEqual(
			target.innerHTML,
			'<div style="background-image: url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png); --css-variable: rgba(0, 0, 0, 1);"></div>'
		);
	}
};
