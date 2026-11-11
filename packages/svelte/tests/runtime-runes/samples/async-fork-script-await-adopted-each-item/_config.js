import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>shift</button>
	<button>discard</button>
`;

// Like `async-fork-script-await-adopted`, with an each item instead of an if branch. The fork is discarded
// while the script is waiting, which doesn't keep the real batch from showing the item once the script is done
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, shift, discard] = target.querySelectorAll('button');

		for (const button of [fork, show, discard]) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, buttons);
		}

		assert.deepEqual(logs, []);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs, ['continued']);
	}
});
