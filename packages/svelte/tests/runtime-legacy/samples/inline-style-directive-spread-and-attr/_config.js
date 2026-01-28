import { ok, test } from '../../test';

export default test({
	html: `
		<p style="color: green;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		let styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'rgb(0, 128, 0)');

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
		assert.htmlEqual(target.innerHTML, '<p style="background-color: green;"></p>');
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, '');
		assert.equal(styles.backgroundColor, 'rgb(0, 128, 0)');

		component.color = 'purple';
		assert.htmlEqual(target.innerHTML, '<p style="background-color: green; color: purple;"></p>');
		styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'rgb(128, 0, 128)');
		assert.equal(styles.backgroundColor, 'rgb(0, 128, 0)');
	}
});
