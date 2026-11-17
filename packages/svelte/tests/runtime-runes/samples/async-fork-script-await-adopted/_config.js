import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>count</button>
	<button>resolve fork</button>
	<button>resolve real</button>
	<button>commit</button>
`;

// A fork and a real batch select the same stable component, but each raw script
// await belongs to its own initializer. Unrelated count changes must not restart
// either attempt, and committing the fork must preserve the established DOM.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, count, resolve_fork, resolve_real, commit] =
			target.querySelectorAll('button');

		fork.click();
		await tick();
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span>`);
		assert.deepEqual(logs.splice(0), ['await 0', 'await 1']);

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span>`);
		assert.deepEqual(logs, []);

		resolve_fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span>`);
		assert.deepEqual(logs.splice(0), ['continued']);

		resolve_real.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><p>0</p>`);
		assert.deepEqual(logs.splice(0), ['continued']);
		const [node] = target.querySelectorAll('p');

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><p>1</p>`);
		assert.equal(target.querySelector('p'), node);
		assert.deepEqual(logs, [], 'commit must not start or continue another initializer');
	}
});
