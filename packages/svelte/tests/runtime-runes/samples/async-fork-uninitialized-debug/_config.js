import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>preload</button>
	<button>navigate</button>
	<button>commit</button>
	<button>discard</button>
`;

export default test({
	async test({ assert, target, logs }) {
		const [preload, navigate, commit, discard] = target.querySelectorAll('button');

		preload.click();
		// Let the async child resolve, without committing its fork.
		await new Promise((resolve) => setTimeout(resolve, 0));
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs, []);

		// A real-world update must not evaluate the speculative child in the real world.
		navigate.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs, []);
		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs, []);

		navigate.click();
		await tick();
		preload.click();
		await new Promise((resolve) => setTimeout(resolve, 0));
		navigate.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs, []);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}pending <p>2</p>`);
		assert.deepEqual(logs, []);

		navigate.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p>`);
		assert.deepEqual(logs, []);
	}
});
