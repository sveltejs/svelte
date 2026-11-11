import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>count</button>
	<button>shift</button>
	<button>commit</button>
`;

// A fork creates a component with a top-level `await` in its script, and a real batch selects the same branch
// while the script is waiting. The script runs once, so the real batch waits for it, too (unlike a batch that
// doesn't select the branch), and then shows the content as it is in its own view
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, count, shift, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span>`);

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span>`);
		assert.deepEqual(logs, []);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><p>0</p>`);
		assert.deepEqual(logs, ['continued']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><p>1</p>`);
		assert.deepEqual(logs, ['continued']);
	}
});
