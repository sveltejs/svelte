import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>hide</button>
	<button>other 0</button>
	<button>other 1</button>
	<button>slow</button>
`;

// Like `async-fork-hide-pending-branch`, with a real batch that waits for work outside the boundary: it
// only reveals the boundary's content once it commits
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		await tick();
		const [hide, , other_1] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p> <p>pending</p>`);

		hide.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p> <p>pending</p>`);
		assert.deepEqual(logs, []);

		other_1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>1</p> <p>sibling</p>`);
		assert.deepEqual(logs, ['effect ran']);
	}
});
