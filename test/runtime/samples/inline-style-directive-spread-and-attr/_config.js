export default {
	html: `
		<p style="color: green;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');

		let styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'green');

		component.color = null;
		assert.htmlEqual(target.innerHTML, '<p style=""></p>');
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, '');

		component.spread = { style: 'color: yellow; padding: 30px;' };

		assert.htmlEqual(target.innerHTML, '<p style="padding: 30px;"></p>');
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, '');
		assert.equal(styles.padding, '30px');

		component.spread = {};
		component.style = 'color: blue; background-color: green;';
		assert.htmlEqual(
			target.innerHTML,
			'<p style="background-color: green;"></p>'
		);
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, '');
		assert.equal(styles.backgroundColor, 'green');

		component.color = 'purple';
		assert.htmlEqual(
			target.innerHTML,
			'<p style="background-color: green; color: purple;"></p>'
		);
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'purple');
		assert.equal(styles.backgroundColor, 'green');
	}
};
