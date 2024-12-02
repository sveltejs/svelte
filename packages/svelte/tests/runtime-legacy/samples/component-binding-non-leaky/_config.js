import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<p>count: </p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');
		ok(button);

		button.dispatchEvent(click);
		flushSync();

		assert.equal(component.x, undefined);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
			<p>count: </p>
		`
		);

		button.dispatchEvent(click);
		flushSync();

		assert.equal(component.x, undefined);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>2</button>
			<p>count: </p>
		`
		);
	}
});
