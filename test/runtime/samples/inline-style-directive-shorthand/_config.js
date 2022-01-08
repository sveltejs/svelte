export default {
	html: `
		<p style="color: red;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');

		let styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');

		component.color = 'blue';
		assert.htmlEqual(target.innerHTML, '<p style="color: blue;"></p>');

		styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'blue');
	}
};
