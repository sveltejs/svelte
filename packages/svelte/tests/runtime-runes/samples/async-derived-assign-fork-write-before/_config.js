import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>fork</button><button>assign</button><button>commit</button>';

// An assignment to a derived holds until one of its dependencies is written after it. A fork's
// write that happened before the assignment doesn't make it outdated, also not when the fork is
// committed later — which is what the fork's view showed (and what it ran its async work with)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [f, assign, commit] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['probe 2']);

		// the fork's view: d = 5 * 2
		f.click();
		await tick();
		assert.deepEqual(logs, ['probe 2', 'probe 10']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p>`);

		// the assignment is the latest write: it holds in the real world and in the fork's view
		assign.click();
		await tick();
		assert.deepEqual(logs, ['probe 2', 'probe 10', 'probe 100', 'probe 100']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>100</p>`);

		// committing the fork doesn't undo the assignment, and nothing runs again
		commit.click();
		await tick();
		await tick();
		assert.deepEqual(logs, ['probe 2', 'probe 10', 'probe 100', 'probe 100']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>100</p>`);
	}
});
