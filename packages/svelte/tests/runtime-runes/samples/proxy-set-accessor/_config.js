import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	html: `<input><p>svelte</p>`,
	ssrHtml: `<input value="SVELTE"><p>svelte</p>`,

	test({ assert, target }) {
		const input = target.querySelector('input');
		ok(input);

		const event = new window.Event('input');

		input.value = 'SVELTEy';
		input.dispatchEvent(event);

		flushSync();

		assert.htmlEqual(target.innerHTML, `<input><p>sveltey</p>`);
		assert.equal(input.value, 'SVELTEY');
	}
});
