import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>show</button>
	<button>gate</button>
	<button>resolve</button>
`;

export default test({
	async test({ assert, target, logs }) {
		const [show, gate, resolve] = target.querySelectorAll('button');

		show.click();
		await tick();
		assert.deepEqual(logs, ['load']);

		// An unrelated update re-runs the block while the first batch is still pending.
		// It sees `show = false` (the pending batch's write is held back) and commits
		// without the branch — but the pending batch still wants it, so the branch
		// (and its in-flight request) must survive rather than be recreated
		gate.click();
		await tick();
		assert.deepEqual(logs, ['load']);
		assert.htmlEqual(target.innerHTML, buttons);

		resolve.click();
		await tick();
		assert.deepEqual(logs, ['load']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>loaded</p>`);
	}
});
