import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>preload</button>
	<button>reveal outer</button>
	<button>reveal and navigate</button>
	<button>navigate</button>
	<button>resolve</button>
	<button>commit</button>
	<button>discard</button>
	<button>reset</button>
`;

export default test({
	// batch-views: the `{#if inner}` branch that the fork created inside its offscreen `{#if outer}` branch (on the
	// block's first run) isn't recorded as the fork's selection. When a real batch reveals the outer branch and
	// commits it without the inner one, the inner branch is destroyed, and the fork creates it again, which starts
	// `load()` again; after the commit, the boundary shows `loading` instead of the preloaded result
	skip: true,
	async test({ assert, target, logs }) {
		const [preload, reveal, reveal_and_navigate, navigate, resolve, commit, discard, reset] =
			target.querySelectorAll('button');

		for (const mode of ['separate', 'together', 'pending']) {
			for (const finish of [commit, discard]) {
				try {
					preload.click();

					if (mode !== 'pending') {
						resolve.click();
						await tick();
					}

					assert.htmlEqual(target.innerHTML, buttons);
					assert.deepEqual(logs, ['load']);

					if (mode === 'together') {
						reveal_and_navigate.click();
					} else {
						reveal.click();
						await tick();
						assert.htmlEqual(target.innerHTML, `${buttons}<section></section>`);
						navigate.click();
					}

					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<section></section>`);
					assert.deepEqual(logs, ['load']);

					if (mode === 'pending') {
						resolve.click();
						await tick();
						assert.htmlEqual(target.innerHTML, `${buttons}<section></section>`);
					}

					finish.click();
					await tick();
					assert.htmlEqual(
						target.innerHTML,
						`${buttons}<section>${finish === commit ? 'pending <p>2</p>' : ''}</section>`
					);
					assert.deepEqual(logs, ['load']);

					if (finish === commit) {
						navigate.click();
						await tick();
						assert.htmlEqual(target.innerHTML, `${buttons}<section><p>2</p></section>`);
						assert.deepEqual(logs, ['load']);
					}

					reset.click();
					await tick();
					assert.htmlEqual(target.innerHTML, buttons);
					logs.length = 0;
				} catch (e) {
					/** @type {Error} */ (e).message =
						`${mode}/${finish === commit ? 'commit' : 'discard'}: ${/** @type {Error} */ (e).message}`;
					throw e;
				}
			}
		}
	}
});
