import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>update</button>
	<button>v 0</button>
	<button>v 1</button>
	<button>y 1</button>
`;

// The batch that creates the component commits right away, because the boundary shows its pending snippet,
// and the script waits for its run of the `await`. A later batch runs it again, and has its result first, but
// waits for other work. So the script keeps waiting for the batch that created it — until the later batch
// commits, which supersedes that batch's run: it won't get a value of its own anymore. Then the script continues
// (with the value that's now part of every view), rather than waiting forever
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [update, v0, v1, y1] = target.querySelectorAll('button');

		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>pending</p>`);
		assert.deepEqual(logs.splice(0), ['v 0']);

		update.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>pending</p>`);
		assert.deepEqual(logs.splice(0), ['y 1', 'v 1']);

		// the later batch's result: the script waits for the batch that created the component
		v1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>pending</p>`);
		assert.deepEqual(logs.splice(0), []);

		// the later batch commits, which supersedes the run of the batch that created the component
		y1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>1</span>`);
		assert.deepEqual(logs.splice(0), ['continued with 1']);

		// (superseded, so this does nothing)
		v0.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>1</span>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
