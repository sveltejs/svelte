import { tick } from 'svelte';
import { test } from '../../test';

// The initial batch has committed its writes, but its script still has pending work.
// An unrelated commit must not discard it as an empty subset of that batch's writes.
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '');

		instance.bump();
		await tick();
		assert.htmlEqual(target.innerHTML, '');

		instance.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>one ready 1</p>');
	}
});
