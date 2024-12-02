import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return { count: 42 };
	},

	html: `
		<input type=range>
		<p>number 42</p>
	`,

	ssrHtml: `
		<input type=range value=42>
		<p>number 42</p>
	`,

	test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		ok(input);
		assert.equal(input.value, '42');

		const event = new window.Event('input');

		input.value = '43';
		input.dispatchEvent(event);
		flushSync();

		assert.equal(component.count, 43);
		assert.htmlEqual(
			target.innerHTML,
			`
			<input type='range'>
			<p>number 43</p>
		`
		);

		component.count = 44;
		assert.equal(input.value, '44');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input type='range'>
			<p>number 44</p>
		`
		);
	}
});
