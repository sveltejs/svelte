import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork x = 1</button>
	<button>update y and discard</button>
	<button>commit y fork and discard</button>
	<button>resolve requests</button>
	<button>reset</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [speculate, update, commit, resolve, reset] = target.querySelectorAll('button');

		for (const action of [update, commit]) {
			speculate.click();
			await tick();
			logs.length = 0;

			// Discard before the queued fork revalidation runs. It must not restart
			// the async effect and abort the real world's request, whether the write
			// came from a normal update or another fork's commit.
			action.click();
			await tick();
			resolve.click();
			await tick();

			assert.htmlEqual(target.innerHTML, `${buttons}<p>0/1</p>`);
			assert.deepEqual(logs, ['0/1']);

			reset.click();
			await tick();
		}
	}
});
