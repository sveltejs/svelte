import { tick } from 'svelte';
import { test } from '../../test';

// A component with a top-level `await` inside a branch that a fork created is revealed by a real batch
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [fork_a, show, reset, resolve_all, discard, commit] = target.querySelectorAll('button');
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
					fork_a.click();
					await tick();
					if (resolved) {
						resolve_all.click();
						await tick();
					}
					assert.deepEqual(instance.log.splice(0), [1]);

					show.click();
					await tick();
					assert.deepEqual(instance.log.splice(0), [0]);

					if (finish === 'discard') discard.click();
					else commit.click();
					await settle();
					const n = finish === 'commit' ? 1 : 0;
					assert.htmlEqual(output.innerHTML, `<p>${n}|${n}</p>`);
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
});
