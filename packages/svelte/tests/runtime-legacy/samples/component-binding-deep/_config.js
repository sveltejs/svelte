import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<input>
		<p>foo</p>
	`,

	ssrHtml: `
		<input value=foo>
		<p>foo</p>
	`,

	test({ assert, component, target, window }) {
		const event = new window.MouseEvent('input');
		const input = target.querySelector('input');
		ok(input);

		input.value = 'blah';
		input.dispatchEvent(event);
		flushSync();

		assert.deepEqual(component.deep, { name: 'blah' });
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>blah</p>
		`
		);
	}
});
