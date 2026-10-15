import { tick } from 'svelte';
import { test } from '../../test';

/**
 * @param {number[]} list
 * @param {boolean} show
 */
const html = (list, show) =>
	list.map((x) => `<div>${x}|${x}${show ? `<p>${x}</p>` : ''}</div>`).join('');

// A fork creates an each item, and branches inside of it (and inside an existing item) that contain
// async expressions. A real batch adopts the item first and the branches later, or both at once.
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [fork_a, list_and_show, list, show, reset, resolve_all, discard, commit] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('main');

		const settle = async () => {
			for (let i = 0; i < 5; i++) {
				await tick();
				resolve_all.click();
			}
			await tick();
		};

		await settle();
		assert.htmlEqual(output.innerHTML, html([0], false));
		instance.log.length = 0;

		for (const together of [false, true]) {
			for (const finish of ['discard', 'commit']) {
				const mode = `${together ? 'together' : 'separately'}, ${finish}`;

				try {
					fork_a.click();
					resolve_all.click();
					await tick();
					assert.deepEqual(instance.log.splice(0).sort(), ['p0', 'p1', 'x1']);

					if (!together) {
						// the item is adopted, the branch inside it stays the fork's
						list.click();
						await settle();
						assert.htmlEqual(output.innerHTML, html([0, 1], false));
						assert.deepEqual(instance.log.splice(0), ['x1']);

						show.click();
					} else {
						list_and_show.click();
					}

					await settle();
					assert.htmlEqual(output.innerHTML, html([0, 1], true));
					assert.deepEqual(
						instance.log.splice(0).sort(),
						together ? ['p0', 'p1', 'x1'] : ['p0', 'p1']
					);

					if (finish === 'discard') discard.click();
					else commit.click();
					await settle();
					assert.htmlEqual(output.innerHTML, html([0, 1], true));
					assert.deepEqual(instance.log, []);

					reset.click();
					await settle();
					assert.htmlEqual(output.innerHTML, html([0], false));
					instance.log.length = 0;
				} catch (e) {
					/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
					throw e;
				}
			}
		}
	}
});
