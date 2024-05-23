import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { foo: 0, bar: 0 };
	},

	html: `
		<button>click me</button>
		<p>foo: 0</p>
		<p>bar: 0</p>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		button?.dispatchEvent(click);
		flushSync();

		assert.equal(component.foo, 4);
		assert.equal(component.bar, 2);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click me</button>
			<p>foo: 4</p>
			<p>bar: 2</p>
		`
		);
	}
});
