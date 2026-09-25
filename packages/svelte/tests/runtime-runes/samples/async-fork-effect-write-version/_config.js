import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>resolve</button>
	<button>commit</button>
`;

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [fork_button, resolve, commit] = target.querySelectorAll('button');

		assert.deepEqual(logs, [[0, true]]);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		fork_button.click();

		await tick();
		assert.deepEqual(logs, [
			[0, true],
			[2, true]
		]);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		// `delayed` changes, but `nonnegative` stays true. The async expression has
		// already consumed the fork's `doubled`, so it should not run again.
		resolve.click();
		await tick();
		assert.deepEqual(logs, [
			[0, true],
			[2, true]
		]);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p>`);
	}
});
