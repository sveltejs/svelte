export default {
	props: {
		fontWeight: 'bold;',
		fontSize: 12
	},
	html: `
		<p style="color: red; font-weight: bold; font-size: 12px;"></p>
	`,

	test({ assert, target, window, component }) {
		const p = target.querySelector('p');
		let styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
		assert.equal(styles.fontWeight, 'bold');
		assert.equal(styles.fontSize, '12px');

		component.fontWeight = 'normal;';
		component.fontSize = '14';
		assert.htmlEqual(target.innerHTML, '<p style="color: red; font-weight: normal; font-size: 14px;"></p>');
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
		assert.equal(styles.fontWeight, 'normal');
		assert.equal(styles.fontSize, '14px');
	}
};
