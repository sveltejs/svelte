import { flushSync, tick } from 'svelte';
import { test } from '../../test';
import { async_mode } from '../../../helpers.js';
import {
	disable_async_mode_flag,
	enable_async_mode_flag
} from '../../../../src/internal/flags/index.js';

// Async mode turns on in the middle of a flush: an effect of a batch that was created
// without async turns it on, and writes state that reveals an `await`
export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true } },
	props: { enable: enable_async_mode_flag },

	before_test() {
		disable_async_mode_flag();
	},

	// (the suite's mode decides, not the value the flag had: importing this sample turned it on)
	after_test() {
		if (async_mode) enable_async_mode_flag();
		else disable_async_mode_flag();
	},

	async test({ assert, target }) {
		const [count, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, `<p>0</p>`);

		count.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, `<p>1</p>`);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, `<p>1</p><p>resolved 1</p>`);

		count.click();
		await tick();
		assert.htmlEqual(output.innerHTML, `<p>2</p><p>resolved 2</p>`);
	}
});
