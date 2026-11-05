import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	test({ assert, target, logs }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));

		assert.deepEqual(logs, ['a', 'hello', 'c', 'hello']);
		logs.length = 0;

		input.value = 'hello!';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		assert.deepEqual(logs, ['a', 'hello!', 'c', 'hello!']);
		logs.length = 0;

		input.value = 'hello!!';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		assert.deepEqual(logs, ['a', 'hello!!', 'b', 'hello!!', 'c', 'hello!!']);
		logs.length = 0;

		input.value = 'hello!!!';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		assert.deepEqual(logs, ['a', 'hello!!!', 'b', 'hello!!!', 'c', 'hello!!!']);

		assert.htmlEqual(target.innerHTML, `<input /><p>hello!!!</p><p>hello!!!</p><p>hello!!!</p>`);
	}
});
