import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>fork</button><button>assign</button><button>commit</button>';

// A fork's write to a dependency of a derived that happened after an assignment to the derived
// makes the assignment outdated: in the fork's view, and when the fork is committed
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [f, assign, commit] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['probe 2']);

		assign.click();
		await tick();
		assert.deepEqual(logs, ['probe 2', 'probe 100']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>100</p>`);

		// the fork's view: d = 5 * 2
		f.click();
		await tick();
		assert.deepEqual(logs, ['probe 2', 'probe 100', 'probe 10']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>100</p>`);

		// what the fork computed is still valid when it's committed
		commit.click();
		await tick();
		await tick();
		assert.deepEqual(logs, ['probe 2', 'probe 100', 'probe 10']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>10</p>`);
	}
});
