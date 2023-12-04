import { ok, test } from '../../test';
import { writable } from 'svelte/store';
import { flushSync } from 'svelte';

export default test({
	get props() {
		return { c: writable(0) };
	},

	html: `
		<p>a: 0</p>
		<p>b: 0</p>
		<p>c: 0</p>

		<button>+1</button>
	`,

	async test({ assert, component, target }) {
		const button = target.querySelector('button');
		ok(button);

		flushSync(() => button.click());

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 1</p>
			<p>b: 1</p>
			<p>c: 1</p>

			<button>+1</button>
		`
		);

		flushSync(() => component.c.set(42));

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 42</p>
			<p>b: 42</p>
			<p>c: 42</p>

			<button>+1</button>
		`
		);
	}
});
