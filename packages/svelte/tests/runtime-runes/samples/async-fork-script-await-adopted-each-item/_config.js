import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>resolve fork</button>
	<button>resolve real</button>
	<button>discard</button>
`;

// Like async-fork-script-await-adopted, but with an each item. Discarding the
// creator does not cancel the adopting real attempt or let the discarded raw
// await continue when its user promise eventually resolves.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, resolve_fork, resolve_real, discard] = target.querySelectorAll('button');

		for (const button of [fork, show, discard]) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, buttons);
		}
		assert.deepEqual(logs.splice(0), ['await 0', 'await 1']);

		resolve_real.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs.splice(0), ['continued']);
		const [node] = target.querySelectorAll('p');

		resolve_fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.equal(target.querySelector('p'), node);
		assert.deepEqual(logs, [], 'discarded raw await cannot continue or publish');
	}
});
