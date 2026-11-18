import { tick } from 'svelte';
import { test } from '../../test';

// A later batch adopts the pending child and aborts its first load through a synchronous
// derived. Its replacement result must resume the script rather than remain buffered
// behind the original batch's aborted result.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show, update, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		show.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);
		assert.htmlEqual(output.innerHTML, '');

		update.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['aborted 1', 'load 2']);
		assert.htmlEqual(output.innerHTML, '');

		resolve.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['continued 2']);
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
	}
});
