import { ok, test } from '../../test';

export default test({
	html: `
		<p style="color: green; transform: translateX(45px); border: 100px solid pink;"></p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		const styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'rgb(0, 128, 0)');
		assert.equal(styles.transform, 'translateX(45px)');
		assert.equal(styles.border, '100px solid pink');

		component.translate_x = '100%';
		component.border_width = 20;
		component.border_color = 'yellow';

		assert.htmlEqual(
			target.innerHTML,
			'<p style="color: green; transform: translateX(100%); border: 20px solid yellow;"></p>'
		);
	}
});
