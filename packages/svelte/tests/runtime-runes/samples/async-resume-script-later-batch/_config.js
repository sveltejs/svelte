import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>first 1</button>
	<button>second 1</button>
	<button>first 2</button>
	<button>second 2</button>
	<button>reset</button>
`;

// Like `async-resume-recheck`, with two `await`s in a component's script (`$.run`) instead of a template
// expression (`$.flatten`). Batch A reveals the component, and its first result comes in, so the script continues
// in A's view and starts the second `await`. Then a later batch B reveals the branch, too (`b || a`, so that the
// block reads `b`), and re-runs both expressions in its own view. B's second result is there before A's, but the
// script must not continue with it: the first value of `second` comes from A's run, so the script continues (and
// the content is created) once that one is done, in A's view. Whatever B resolves in the meantime, it waits for
// that, and then commits its own values
export default test({
	mode: ['client'],
	skip: true,
	async test({ assert, target, logs }) {
		const [a, b, first_1, second_1, first_2, second_2, reset] = target.querySelectorAll('button');

		for (const next of ['a', 'b']) {
			try {
				a.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), ['first 1']);

				// A's first result: the script continues in A's view
				first_1.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), ['second 1']);

				// B reveals the branch, too, and re-runs both expressions in its own view
				b.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), ['first 2', 'second 2']);

				// B's second result overtakes A's, but the script waits for A's
				second_2.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), []);

				if (next === 'a') {
					// A's second result: the script continues and A commits, then B once its first result is in
					second_1.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
					assert.deepEqual(logs.splice(0), ['continued with 1 1']);

					first_2.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
					assert.deepEqual(logs.splice(0), []);
				} else {
					// B has all its results, but still waits for the content, which A creates
					first_2.click();
					await tick();
					assert.htmlEqual(target.innerHTML, buttons);
					assert.deepEqual(logs.splice(0), []);

					// A's second result: the script continues in A's view, A commits, and B right after it
					second_1.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
					assert.deepEqual(logs.splice(0), ['continued with 1 1']);
				}

				reset.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), []);
			} catch (e) {
				/** @type {Error} */ (e).message = `${next} next: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
