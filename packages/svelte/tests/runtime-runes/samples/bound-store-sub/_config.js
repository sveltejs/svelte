import { flushSync } from 'svelte';
import { test } from '../../test';
import { ok } from 'assert';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<p><input type="number"></p>\n{"count":0}`,
	ssrHtml: `<p><input type="number" value="0"></p>\n{"count":0}`,

	test({ assert, target }) {
		const input = target.querySelector('input');
		ok(input);
		const inputEvent = new window.InputEvent('input');

		input.value = '10';
		input.dispatchEvent(inputEvent);

		flushSync();

		assert.htmlEqual(target.innerHTML, `<p><input type="number"></p>\n{"count":10}`);
	}
});
