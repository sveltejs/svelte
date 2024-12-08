import { flushSync } from 'svelte';
import { test } from '../../test';
import { assert_ok } from '../../../suite';

export default test({
	async test({ assert, target, logs }) {
		const input = target.querySelector('input');

		assert_ok(input);

		input.value = '2';
		input.dispatchEvent(new window.Event('input'));

		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>a: 2</button><input type="value">`);

		assert.deepEqual(logs, ['b', '2', 'a', '2']);
	}
});
