import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		let btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught']);
		assert.htmlEqual(target.innerHTML, `<div>An error occurred!</div>\n0\n<button>+</button>`);

		btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught', 'error caught']);
		assert.htmlEqual(target.innerHTML, `<div>An error occurred!</div>\n0\n<button>+</button>`);
	}
});
