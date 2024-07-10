import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<p><p>invalid</p></p>',
	mode: ['hydrate'],
	recover: true,
	test({ assert, target, logs }) {
		target.click();
		flushSync();
		assert.deepEqual(logs, ['body', 'document', 'window']);
	}
});
