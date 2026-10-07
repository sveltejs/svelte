import { tick } from 'svelte';
import { test } from '../../test';

/** @param {number[]} list */
const html = (list) =>
	list.map((x) => `<b>${x}|${x}|c</b>`).join('') + list.map((x) => `<s>${x}|${x}</s>`).join('');

// Items of keyed and unkeyed each blocks that were created by a fork (and whose async expressions
// therefore only have results in that fork) are adopted by a real batch. The real batch has to run
// their async expressions itself — with dependencies (unkeyed `x`) or without (keyed `x` is a plain
// value, `'c'` is a constant) — whether the fork is discarded or committed afterwards. When the
// fork is committed, its own results are used: nothing is fetched again.
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [
			reset_list,
			fork_list,
			real_list,
			fork_append_2,
			append_2,
			append_5,
			resolve_all,
			discard,
			commit
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('main');

		const settle = async () => {
			for (let i = 0; i < 5; i++) {
				await tick();
				resolve_all.click();
			}
			await tick();
		};

		const reset = async () => {
			reset_list.click();
			await settle();
			assert.htmlEqual(output.innerHTML, html([0, 1]));
			instance.log.length = 0;
		};

		await settle();
		assert.htmlEqual(output.innerHTML, html([0, 1]));
		instance.log.length = 0;

		for (const finish of ['discard', 'commit']) {
			try {
				// the fork creates items, the real batch reuses some of them (with equal and different values)
				fork_list.click();
				assert.deepEqual(
					instance.log.sort(),
					['cc', 'cc', 'k3', 'k2', 'u0', 'u1', 'u2', 'u3'].sort()
				);
				instance.log.length = 0;

				real_list.click();
				if (finish === 'discard') discard.click();
				else commit.click();
				await settle();
				// the real write came last, so it wins either way
				assert.htmlEqual(output.innerHTML, html([3, 0, 1]));
				await reset();

				// the fork's results are already in when the real batch adopts its items with the same values
				fork_append_2.click();
				resolve_all.click();
				await tick();
				assert.htmlEqual(output.innerHTML, html([0, 1]));
				instance.log.length = 0;

				append_2.click();
				await settle();
				assert.htmlEqual(output.innerHTML, html([0, 1, 2]));
				// the fork's results only exist in the fork, so the real batch has to fetch them itself
				assert.deepEqual(instance.log.sort(), ['cc', 'k2', 'u2']);
				instance.log.length = 0;

				if (finish === 'discard') discard.click();
				else commit.click();
				await settle();
				assert.htmlEqual(output.innerHTML, html([0, 1, 2]));
				assert.deepEqual(instance.log, []);
				await reset();

				// the fork is finished while the real batch that adopted its items is still pending
				fork_append_2.click();
				instance.log.length = 0;
				append_2.click();
				await tick();
				assert.deepEqual(instance.log.sort(), ['cc', 'k2', 'u2']);
				instance.log.length = 0;

				if (finish === 'discard') discard.click();
				else commit.click();
				await settle();
				assert.htmlEqual(output.innerHTML, html([0, 1, 2]));
				assert.deepEqual(instance.log, []);
				await reset();

				// a real batch adopts an item with a different value after the fork's results are in
				// (TODO also commit the fork here, once the fork re-running the unkeyed item's expression
				// with the real world's new value no longer keeps the fork's outdated result)
				if (finish === 'discard') {
					fork_append_2.click();
					resolve_all.click();
					await tick();
					instance.log.length = 0;

					append_5.click();
					await settle();
					assert.htmlEqual(output.innerHTML, html([0, 1, 5]));
					// keyed: a new item, unkeyed: the adopted item's input changed (and the fork revalidates it)
					assert.deepEqual(instance.log.sort(), ['cc', 'k5', 'u5', 'u5']);

					discard.click();
					await settle();
					assert.htmlEqual(output.innerHTML, html([0, 1, 5]));
					await reset();
				}
			} catch (e) {
				/** @type {Error} */ (e).message = `${finish}: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
