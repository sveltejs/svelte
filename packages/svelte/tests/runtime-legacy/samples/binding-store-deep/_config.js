import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<input>
		<p>hello world</p>
	`,

	ssrHtml: `
		<input value="world">
		<p>hello world</p>
	`,

	test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		assert.equal(input.value, 'world');

		const event = new window.Event('input');

		/** @type {string[]} */
		const names = [];

		// @ts-ignore
		const unsubscribe = component.user.subscribe((user) => {
			if (!names.includes(user.name)) {
				names.push(user.name);
			}
		});

		input.value = 'everybody';
		input.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>hello everybody</p>
		`
		);

		component.user.set({ name: 'goodbye' });
		flushSync();
		assert.equal(input.value, 'goodbye');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>hello goodbye</p>
		`
		);

		assert.deepEqual(names, ['world', 'everybody', 'goodbye']);
		unsubscribe();
	}
});
