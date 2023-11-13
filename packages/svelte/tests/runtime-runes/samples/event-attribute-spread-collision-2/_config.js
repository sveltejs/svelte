import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>Test</button>`,

	async test({ assert, target, component }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		assert.deepEqual(component.log, ['external!']);
	}
});
