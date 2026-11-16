import { tick } from 'svelte';
import { test } from '../../test';

// The second async derived is initialized after its creating batch committed the
// pending boundary. Its first run reads count immediately and suffix only after
// an await: both dependencies must survive when that run is stored globally.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [begin, suffix, count, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), []);

		begin.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['slow 0']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 0a</p>');
		assert.deepEqual(logs.splice(0), []);

		// The dependency first read after the await must trigger a fresh run.
		suffix.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 0a</p>');
		assert.deepEqual(logs.splice(0), ['slow 0']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 0a!</p>');
		assert.deepEqual(logs.splice(0), []);

		// The original synchronous dependency remains tracked as well.
		count.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 0a!</p>');
		assert.deepEqual(logs.splice(0), ['slow 1']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 1a!</p>');
		assert.deepEqual(logs.splice(0), []);

		// Replacing the run must not lose the late dependency again.
		suffix.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 1a!</p>');
		assert.deepEqual(logs.splice(0), ['slow 1']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>ready 1a!!</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
