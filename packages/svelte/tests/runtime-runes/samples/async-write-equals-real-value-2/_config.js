import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [b, z] = target.querySelectorAll('button');

		// write x = 'b' — the batch is pending on its async expression
		b.click();
		await tick();

		// an independent batch writes y, then x = 'b', which is already the real value:
		// that write must not entangle the batch with the pending one, so y commits now
		z.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>1</p><p>a</p><button>b</button><button>z</button>');
	}
});
