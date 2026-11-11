import { tick } from 'svelte';
import { test } from '../../test';

/** @param {number} n */
const html = (n) => `<p>c</p><section>${n}|${n}</section>`;

// Branches with async expressions (with and without dependencies) that fork `a` created are revealed
// by another batch (a real one, or fork `b`), before or after `a`'s results are in. The revealing batch
// has to run the async expressions itself, since `a`'s results only exist in `a`. When `a` is discarded
// the other batch's results are shown; when it's committed, its own results are shown (nothing is fetched
// again), even though the other batch's results come in later.
export default test({
	// batch-views: once fork `a` is committed, the batch that revealed its branch runs `push('n', 1)` again: its own
	// outdated run of the expression (from when its view had `n = 0`) probably shadows the committed (or folded) run of `a`
	// that is valid in its view (`Batch#get_record` returns the batch's own record first)
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork_a, show, fork_b, reset, resolve_all, discard_a, commit_a, commit_b] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('main');

		const settle = async () => {
			for (let i = 0; i < 5; i++) {
				await tick();
				resolve_all.click();
			}
			await tick();
		};

		for (const revealer of ['real', 'fork']) {
			for (const finish of ['discard', 'commit']) {
				for (const resolved of [true, false]) {
					const mode = `${revealer} reveals, a ${finish}ed, a's results ${resolved ? 'resolved' : 'pending'}`;

					try {
						fork_a.click();
						if (resolved) {
							resolve_all.click();
							await tick();
						}
						assert.deepEqual(logs.splice(0), ['cc', 'n1']);

						if (revealer === 'real') show.click();
						else fork_b.click();
						await tick();
						assert.htmlEqual(output.innerHTML, '');
						assert.deepEqual(logs.splice(0), ['cc', 'n0']);

						if (finish === 'discard') discard_a.click();
						else commit_a.click();
						await settle();
						assert.htmlEqual(
							output.innerHTML,
							finish === 'commit' ? html(1) : revealer === 'real' ? html(0) : ''
						);

						commit_b.click();
						await settle();
						assert.htmlEqual(output.innerHTML, html(finish === 'commit' ? 1 : 0));
						assert.deepEqual(logs, []);

						reset.click();
						await settle();
						assert.htmlEqual(output.innerHTML, '');
					} catch (e) {
						/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
						throw e;
					}
				}
			}
		}
	}
});
