import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		await tick();

		assert.deepEqual(logs, [
			`effect_orphan\n\`$effect\` can only be used inside an effect (e.g. during component initialisation)\nhttps://svelte.dev/e/effect_orphan`
		]);
	}
});
