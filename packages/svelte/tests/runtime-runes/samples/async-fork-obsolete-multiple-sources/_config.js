import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork x = y = 1</button>
	<button>set x = y = 1</button>
	<button>set z = 1</button>
	<button>commit fork</button>
	<button>discard fork</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [speculate, catch_up, update, commit, discard] = target.querySelectorAll('button');

		speculate.click();
		await tick();
		catch_up.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p>`);
		logs.length = 0;

		// All speculative writes are obsolete. Only the real world should react.
		update.click();
		await tick();
		try {
			assert.htmlEqual(target.innerHTML, `${buttons}<p>3</p>`);
			assert.deepEqual(logs, ['1/1/1']);

			// Committing an automatically discarded fork should be a no-op and not throw,
			// as the user cannot really know that something got automatically discarded.
			commit.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}<p>3</p>`);
			assert.deepEqual(logs, ['1/1/1', 'committed']);
		} finally {
			discard.click();
		}
	}
});
