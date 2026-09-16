import { flushSync, tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>preload</button>
	<button>increment</button>
	<button>commit</button>
	<button>reveal</button>
	<button>discard</button>
	<button>preload second</button>
	<button>commit second</button>
	<button>reset</button>
`;

export default test({
	async test({ assert, target }) {
		const [preload, increment, commit, reveal, discard, preload_second, commit_second, reset] =
			target.querySelectorAll('button');

		for (const mode of ['commit', 'reveal', 'second-fork']) {
			preload.click();
			flushSync(() => increment.click());
			assert.htmlEqual(target.innerHTML, buttons);

			if (mode === 'commit') {
				commit.click();
				await tick();
			} else if (mode === 'reveal') {
				flushSync(() => reveal.click());
				discard.click();
			} else {
				preload_second.click();
				discard.click();
				commit_second.click();
				await tick();
			}

			assert.htmlEqual(target.innerHTML, `${buttons}<p>1 2</p>`);
			flushSync(() => increment.click());
			assert.htmlEqual(target.innerHTML, `${buttons}<p>2 4</p>`);
			flushSync(() => reset.click());
			assert.htmlEqual(target.innerHTML, buttons);
		}
	}
});
