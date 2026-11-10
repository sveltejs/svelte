import { tick } from 'svelte';
import { test } from '../../test';

// A fork flush defers the render effects it comes across (marking them clean), and resets the ones
// inside branches it is going to remove. Neither may hide them from the real batch that scheduled them
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, resolve, resolve_and_write, discard] = target.querySelectorAll('button');
		const buttons =
			'<button>fork</button><button>resolve</button><button>resolve and write</button><button>discard</button>';

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span><em>0</em><q>0</q>`);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span><em>0</em><q>0</q>`);

		resolve_and_write.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><em>1</em><q>0</q>`);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><em>1</em><q>0</q>`);
	}
});
