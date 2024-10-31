import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ warnings, assert }) {
		assert.deepEqual(warnings, [
			'Detected a migrated `$:` reactive block in `main.svelte` that both accesses and updates the same reactive value. This may cause recursive updates when converted to an `$effect`.'
		]);
	}
});
