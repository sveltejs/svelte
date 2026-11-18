import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a, x</button>
	<button>a, show</button>
	<button>resolve x</button>
	<button>pop a</button>
	<button>resolve child</button>
	<button>reset</button>
`;

// Batch Y writes the same source as the earlier batch X, and reveals a boundary whose content is pending. That
// work doesn't block Y, so Y is done once its other work is, and merges into X. The boundary resolves after
// that: the effects it deferred (here: the `$effect` in `Child`) go to X, which took over Y's pending work, and
// run when X commits — or, if X committed while the boundary was pending, when the boundary resolves.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [ax, show, resolve_x, pop_a, resolve_child, reset] = target.querySelectorAll('button');

		/**
		 * @param {HTMLElement} button
		 * @param {string} content
		 * @param {string[]} expected
		 */
		async function step(button, content, expected) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}${content}`);
			assert.deepEqual(logs.splice(0), expected);
		}

		await step(reset, '<i>0</i><p>0</p>', []);

		for (const [i, order] of ['boundary first', 'x first'].entries()) {
			try {
				const before = `<i>${i}</i><p>${2 * i}</p>`;

				// X writes `a` and `x`, Y writes `a` and shows the boundary
				await step(ax, before, [`x ${i + 1}`, `a ${2 * i + 1}`]);
				await step(show, before, ['child 1', `a ${2 * i + 2}`]);

				// Y's run of `a`: Y is done, and merges into X (whose run of `a` gets Y's result)
				await step(pop_a, before, []);

				const after = `<i>${i + 1}</i><p>${2 * i + 2}</p>`;

				if (order === 'boundary first') {
					await step(resolve_child, before, []);
					await step(resolve_x, `${after}<span>1</span>`, ['effect']);
				} else {
					await step(resolve_x, `${after}<p>loading</p>`, []);
					await step(resolve_child, `${after}<span>1</span>`, ['effect']);
				}

				await step(reset, after, []);
			} catch (e) {
				/** @type {Error} */ (e).message = `${order}: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
