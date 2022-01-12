export default {
	html: `
		<div style="background-image: url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png);"></div>
	`,

	test({ assert, target, window }) {
		const div = target.querySelector('div');
		const styles = window.getComputedStyle(div);

		assert.equal(styles['background-image'], 'url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png)');

		assert.htmlEqual(
			target.innerHTML,
			'<div style="background-image: url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png);"></div>'
		);
	}
};
