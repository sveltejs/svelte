import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>clear</button><button>shift</button>';

// The batch that sets `object` to `null` waits for async work, so the teardown it causes only runs once
// that resolves, in a later flush — and still sees the object from before
export default test({
	async test({ assert, target, logs }) {
		const [clear, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><div></div>`);

		clear.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><div></div>`);
		assert.deepEqual(logs, []);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>none</p>`);
		assert.deepEqual(logs, ['detach: 1']);
	}
});
