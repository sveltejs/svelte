import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// in dev, `failed` is wrapped in both `$.wrap_snippet` and `$.renderer_snippet`
	compileOptions: { dev: true },
	async test({ assert, target, serialize }) {
		await tick();
		assert.equal(serialize(target), '<p>oops</p>');
	}
});
