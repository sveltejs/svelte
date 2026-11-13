import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>x1</button>
	<button>a</button>
	<button>x0</button>
	<button>commit</button>
`;

// Two `await`s in one expression. A fork re-runs the second, and its result is the first one to arrive. That's
// a value in the fork's view only: when the real world's result of the first expression arrives, the content
// still waits for its own result of the second (instead of being created with no value for it)
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, x1, a, x0, commit] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		for (const button of [fork, x1, a]) {
			button.click();
			await tick();
		}
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		x0.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a 0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a 1</p>`);
	}
});
