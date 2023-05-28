export default {
	html: `
		<p id="my-id" style="width: 65px; color: blue;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'blue');
		assert.equal(styles.width, '65px');
		assert.equal(p.id, 'my-id');

		component.color = 'red';

		assert.htmlEqual(target.innerHTML, '<p id="my-id" style="width: 65px; color: red;"></p>');

		component.obj = { style: 'height: 72px;' };

		assert.htmlEqual(target.innerHTML, '<p style="height: 72px; color: red;"></p>');

		component.obj = { style: 'border-radius: 2px; color: orange' };

		assert.htmlEqual(target.innerHTML, '<p style="border-radius: 2px; color: red;"></p>');

		component.obj = {};

		assert.htmlEqual(target.innerHTML, '<p style="color: red;"></p>');
	}
};
