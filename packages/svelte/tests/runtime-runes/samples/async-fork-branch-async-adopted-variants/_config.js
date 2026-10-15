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
	mode: ['client'],
	async test({ assert, target, instance }) {
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
						assert.deepEqual(instance.log.splice(0), ['cc', 'n1']);

						if (revealer === 'real') show.click();
						else fork_b.click();
						await tick();
						assert.htmlEqual(output.innerHTML, '');
						assert.deepEqual(instance.log.splice(0), ['cc', 'n0']);

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
						assert.deepEqual(instance.log, []);

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
