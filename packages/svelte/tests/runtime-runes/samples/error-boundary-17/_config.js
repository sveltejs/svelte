import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		let btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught 1', 'error caught 2']);
		assert.htmlEqual(target.innerHTML, `<div>content before</div><div>content after</div>`);
	}
});
