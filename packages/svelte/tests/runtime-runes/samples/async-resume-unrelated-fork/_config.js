import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>fork</button>
	<button>shift</button>
	<button>commit</button>
	<button>discard</button>
	<button>reset</button>
`;

// Like `async-resume-unrelated-batch`, with a fork that reveals the branch that the pending batch A created.
// The fork folds A into its view (forks fold the earlier batches whose async expressions they re-run), so it
// doesn't run the expression either. Committed, it's merged into A; discarded, it leaves A alone.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, fork, shift, commit, discard, reset] = target.querySelectorAll('button');

		for (const mode of ['commit', 'commit after', 'discard']) {
			try {
				a.click();
				await tick();
				fork.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<span>false</span>`);
				assert.deepEqual(logs, ['push 1']);

				if (mode === 'commit') {
					commit.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<span>false</span>`);
				} else if (mode === 'discard') {
					discard.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<span>false</span>`);
				}

				shift.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<span>${mode === 'commit'}</span><p>1 1</p>`);

				if (mode === 'commit after') {
					commit.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<span>true</span><p>1 1</p>`);
				}

				assert.deepEqual(logs, ['push 1']);

				reset.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<span>false</span>`);
				assert.deepEqual(logs, ['push 1']);
				logs.length = 0;
			} catch (e) {
				/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
