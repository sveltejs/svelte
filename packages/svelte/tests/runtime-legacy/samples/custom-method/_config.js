import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>+1</button>
		<p>0</p>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });

		button.dispatchEvent(event);
		flushSync();
		assert.equal(component.counter, 1);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>1</p>
		`
		);

		button.dispatchEvent(event);
		flushSync();
		assert.equal(component.counter, 2);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>2</p>
		`
		);

		assert.equal(component.foo(), 42);
	}
});
