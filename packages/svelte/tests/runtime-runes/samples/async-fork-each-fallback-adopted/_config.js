import { tick } from 'svelte';
import { test } from '../../test';

// The fallback of an each block, created by a fork, is adopted by a real batch: it has to run the
// fallback's async expression itself, since the fork's result only exists in the fork
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [fork_empty, empty, reset, resolve_all, discard, commit] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('main');

		const settle = async () => {
			for (let i = 0; i < 5; i++) {
				await tick();
				resolve_all.click();
			}
			await tick();
		};

		for (const finish of ['discard', 'commit']) {
			for (const resolved of [true, false]) {
				const mode = `${finish}, ${resolved ? 'resolved' : 'pending'}`;

				try {
					fork_empty.click();
					if (resolved) {
						resolve_all.click();
						await tick();
					}
					assert.deepEqual(instance.log.splice(0), ['empty']);

					empty.click();
					await tick();
					assert.deepEqual(instance.log.splice(0), ['empty']);

					if (finish === 'discard') discard.click();
					else commit.click();
					await settle();
					assert.htmlEqual(output.innerHTML, '<p>empty</p>');
					assert.deepEqual(instance.log, []);

					reset.click();
					await settle();
					assert.htmlEqual(output.innerHTML, '<b>0</b>');
				} catch (e) {
					/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
					throw e;
				}
			}
		}
	}
});
