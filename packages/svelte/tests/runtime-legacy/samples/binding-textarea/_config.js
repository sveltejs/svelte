import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return { value: 'some text' };
	},

	html: `
		<textarea></textarea>
		<p>some text</p>
	`,

	ssrHtml: `
		<textarea>some text</textarea>
		<p>some text</p>
	`,

	test({ assert, component, target, window }) {
		const textarea = target.querySelector('textarea');
		ok(textarea);
		assert.equal(textarea.value, 'some text');

		const event = new window.Event('input');

		textarea.value = 'hello';
		textarea.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<textarea></textarea>
			<p>hello</p>
		`
		);

		component.value = 'goodbye';
		assert.equal(textarea.value, 'goodbye');
		assert.htmlEqual(
			target.innerHTML,
			`
			<textarea></textarea>
			<p>goodbye</p>
		`
		);
	}
});
