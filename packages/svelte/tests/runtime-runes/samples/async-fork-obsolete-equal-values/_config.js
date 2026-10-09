import { tick } from 'svelte';
import { test } from '../../test';

// A fork whose only remaining values equal the real ones is obsolete. Here, the forks re-run the
// each block in their own view after `list` changed, writing the (unchanged) item values, which
// they hold. Once the real world has overtaken fork A's only change (`show = true`), these must not
// keep it alive: otherwise it would be committed as a real batch instead of being discarded, and
// its `{#await}` would resolve with a stale `b` (from fork B, committed later) and win over the
// real result.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [fork_a, fork_b, write_list, write_real, commit_a, commit_b, resolve_all] =
			target.querySelectorAll('button');
		const buttons = [...target.querySelectorAll('button')].map((b) => b.outerHTML).join('');

		const settle = async () => {
			for (let i = 0; i < 10; i++) {
				await tick();
				resolve_all.click();
			}
			await tick();
		};

		await settle();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>p0</p><s>0</s><s>1</s><q>aw0</q>`);

		fork_a.click();
		fork_b.click();

		// same items, but a new array, so the forks re-run the each block
		write_list.click();
		await tick();

		// overtakes everything fork A changed (and `b` in fork B)
		write_real.click();
		commit_a.click();
		commit_b.click();

		await settle();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>p1</p><section>s2</section><s>0</s><s>1</s><q>aw2</q>`
		);
	}
});
