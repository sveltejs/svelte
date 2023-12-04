import { ok, test } from '../../test';
import { writable } from 'svelte/store';
import { flushSync } from 'svelte';

export default test({
	get props() {
		return { count: writable(0) };
	},

	html: `
		<button>double 0</button>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const click = new window.MouseEvent('click', { bubbles: true });

		flushSync(() => button.dispatchEvent(click));

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>double 2</button>
		`
		);

		flushSync(() => component.count.set(42));

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>double 84</button>
		`
		);
	}
});
