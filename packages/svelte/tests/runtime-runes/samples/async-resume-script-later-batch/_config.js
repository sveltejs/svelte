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

// A and B initialize independently until one publishes. A pending attempt then
// adopts the established initializer: reactive producers can update in its view
// without finishing its old imperative suffix. A's late result must never
// overwrite a newer committed B result.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, second_1, first_2, second_2, reset] = target.querySelectorAll('button');

		for (const next of ['a', 'b']) {
			try {
				a.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), ['first 1']);

				first_1.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), ['second 1']);

				b.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs.splice(0), ['first 2']);

				if (next === 'a') {
					// Leave B's first result pending so A can finish its older view.
					second_1.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
					// Adoption starts B's first second-site invocation: its x=2 differs
					// from A's completed x=1. The parent push function is unchanged.
					assert.deepEqual(logs.splice(0), ['continued with 1 1', 'second 2']);

					first_2.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
					assert.deepEqual(logs.splice(0), [], 'adoption must not duplicate the second(2) request');

					second_2.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
					assert.deepEqual(logs.splice(0), [], 'B must not resume its abandoned imperative suffix');
				} else {
					first_2.click();
					await tick();
					assert.htmlEqual(target.innerHTML, buttons);
					assert.deepEqual(logs.splice(0), ['second 2']);

					second_2.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
					assert.deepEqual(logs.splice(0), ['continued with 2 2']);

					second_1.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
					assert.deepEqual(logs.splice(0), []);
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
