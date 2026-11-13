import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>hide</button>
	<button>resolve init</button>
`;

// A fork creates a branch with an `await` inside a boundary that shows its pending snippet, then stops
// selecting it (a real batch commits `hide`). Its expression settles, but its content is never created, so
// the branch is the last thing the boundary waits for. It's destroyed when the fork commits, i.e. after the
// fork's traversal — the effects that the boundary deferred must still run, also those inside a branch that
// the traversal skipped (`{#if yes}`)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, hide, init] = target.querySelectorAll('button');
		await tick();

		for (const button of [fork, hide, init]) {
			button.click();
			await tick();
		}

		assert.htmlEqual(target.innerHTML, `${buttons} <p>sibling</p> <p>init</p>`);
		assert.deepEqual(logs, ['effect ran']);
	}
});
