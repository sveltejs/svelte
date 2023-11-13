import { ok, test } from '../../test';

export default test({
	html: `
		<p class="svelte-y94hdy" style="color: red !important; font-size: 20px !important; opacity: 1;">red</p>
	`,

	test({ assert, component, target, window }) {
		const p = target.querySelector('p');
		ok(p);

		let styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'red');
		assert.equal(styles.fontSize, '20px');

		component.color = 'green';

		styles = window.getComputedStyle(p);
		assert.equal(styles.color, 'green');
	}
});
