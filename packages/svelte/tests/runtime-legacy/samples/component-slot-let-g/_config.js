import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<span slot="foo" class="1">1</span>
		0
	`,
	test({ assert, target, component, window }) {
		component.x = 2;

		assert.htmlEqual(
			target.innerHTML,
			`
			<span slot="foo" class="2">2</span>
			0
		`
		);

		const span = target.querySelector('span');
		span?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span slot="foo" class="2">2</span>
			2
		`
		);
	}
});
