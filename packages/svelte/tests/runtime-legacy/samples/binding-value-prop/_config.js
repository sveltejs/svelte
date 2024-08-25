import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	accessors: false,
	html: `<input type="text">\naaa`,
	ssrHtml: `<input type="text" value="aaa">\naaa`,

	test({ assert, target }) {
		const input = target.querySelector('input');
		ok(input);

		const event = new window.Event('input');

		input.value = 'aaa2';
		input.dispatchEvent(event);

		flushSync();

		assert.htmlEqual(target.innerHTML, `<input type="text">\naaa2`);
	}
});
