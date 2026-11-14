import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>show</button>
	<button>fork</button>
	<button>shift</button>
	<button>commit</button>
`;

// A fork's run of an async expression inside a pending boundary doesn't supersede the run of a real batch:
// the fork's result isn't part of the real world until it's committed
export default test({
	async test({ assert, target, logs }) {
		const [show, fork, shift, commit] = target.querySelectorAll('button');

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading</p>`);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading</p>`);

		// The real batch's result reveals the boundary without waiting for the fork.
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);
		assert.deepEqual(logs, [0]);

		// Committing the fork must still wait for its own pending result.
		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);
		assert.deepEqual(logs, [0]);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>1</p>`);
		assert.deepEqual(logs, [0, 1]);
	}
});
