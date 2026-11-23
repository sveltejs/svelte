import { tick } from 'svelte';
import { test } from '../../test';

// The fork creates the shared script but is discarded before its first async
// derived exists. Resuming the raw script await must select the adopting real
// batch's view rather than creating fresh work for the discarded fork.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, discard, begin, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['begin']);

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		// The first async derived is created only now, and must never load x=1.
		begin.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 2']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), ['continued 2']);
	}
});
