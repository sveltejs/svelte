import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return { value: '' };
	},

	html: `
		<input>
		<p></p>
	`,

	ssrHtml: `
		<input value="">
		<p></p>
	`,

	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		const event = new window.Event('input');
		input.value = 'h';
		input.dispatchEvent(event);
		flushSync();

		assert.equal(input.value, 'H');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>H</p>
		`
		);

		input.value = 'he';
		input.dispatchEvent(event);
		flushSync();
		assert.equal(input.value, 'HE');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>HE</p>
		`
		);
	}
});
