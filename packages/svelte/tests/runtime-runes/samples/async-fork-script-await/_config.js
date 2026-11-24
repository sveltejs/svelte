import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>shift</button>
	<button>commit</button>
`;

// A fork creates a component with a top-level `await` in its script. The script continues in the fork's view
// once the fork has its result, which isn't part of the real world until the fork is committed
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, shift, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 1']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);
	}
});
