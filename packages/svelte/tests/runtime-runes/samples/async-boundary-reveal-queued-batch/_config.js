import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>resolve</button><button>update</button>';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [resolve, update] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>pending</p>`);
		assert.deepEqual(logs, []);

		// Queue an unrelated batch before the result's batch flushes. The boundary's
		// deferred effect must not run until its content has been rendered.
		resolve.click();
		queueMicrotask(() => update.click());
		await tick();

		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>ready</p>`);
		assert.deepEqual(logs, ['ready']);
	}
});
