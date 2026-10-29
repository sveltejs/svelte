import { tick } from 'svelte';
import { test } from '../../test';

// The content of a pending boundary is created in the view of the batch that created the boundary, once its
// first value is there — without that batch being processed. Another batch that is processed afterwards
// must re-validate it in its own view, even if it was the last batch to be processed
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [show, b, resolve_x_y, resolve_z] = target.querySelectorAll('button');
		const buttons =
			'<button>show</button><button>b</button><button>resolve x, y</button><button>resolve z</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span><i>0</i>`);

		// batch A: shows the boundary, whose content is pending -> A commits, but stays around
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span><i>0</i><p>loading</p>`);

		// batch B
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span><i>0</i><p>loading</p>`);

		// A and B are processed, then A creates the boundary's content in its view, where `b` is 0
		resolve_x_y.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>0</span><i>0</i><p>x 0</p>`);

		// B commits, and the content with it
		resolve_z.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>1</span><i>1</i><p>x 1</p>`);
	}
});
