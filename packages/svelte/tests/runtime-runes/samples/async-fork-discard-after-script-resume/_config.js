import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');

		show.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, []);

		resolve.click();
		await tick();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>done</p>');
		// The adopter must run the effect created in the now-discarded fork.
		assert.deepEqual(logs, ['created']);
	}
});
