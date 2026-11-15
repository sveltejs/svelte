import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, instance, logs }) {
		await tick();
		instance.start();
		await tick();
		instance.update();
		await tick();
		instance.reject();
		await tick();

		// A skips the shared branch, but B still needs it. A's successful first value
		// must be observed before B publishes its buffered rejection.
		instance.hide();
		await tick();
		instance.resolve();
		await tick();
		assert.deepEqual(logs, [1]);

		instance.finish();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>1</p><p>failed: later</p>');
	}
});
