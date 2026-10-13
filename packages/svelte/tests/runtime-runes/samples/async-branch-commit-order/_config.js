import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>a</button><button>b</button><button>resolve a1</button><button>resolve b1</button>';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a, b, resolve_a1, resolve_b1] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>0</p><p>0</p>${buttons}`);

		// batch A waits on its key; batch B registers its key right away
		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p><p>0</p>${buttons}`);

		// the older batch commits first
		resolve_a1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p><p>1</p>${buttons}`);

		// the newer batch commits with its own branch
		resolve_b1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>1</p><p>B</p>${buttons}`);
	}
});
