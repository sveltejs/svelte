import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>+1</button>
		<p>count: 0</p>
	`,

	test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');
		ok(button);

		button.dispatchEvent(click);
		flushSync();

		assert.equal(component.x, 1);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>count: 1</p>
		`
		);

		button.dispatchEvent(click);
		flushSync();

		assert.equal(component.x, 2);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>count: 2</p>
		`
		);
	}
});
