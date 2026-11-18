import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>b = 2</button><button>b = 0</button><button>resolve k3</button><button>resolve k0</button><button>resolve all</button>';

// A batch's async result that equals the current real value (but not the value the batch sees,
// because an earlier pending batch has a different one in flight) must not be dropped, or the
// earlier batch's result wins although the later batch reverted the input
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [b2, b0, resolve_k3, resolve_k0, resolve_all] = target.querySelectorAll('button');

		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);

		// batch 1 requests k2/k3
		b2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);

		// batch 2 requests k0/k1, which equal the values currently shown
		b0.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);

		resolve_k3.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);

		// batch 2's first result equals the real value
		resolve_k0.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);

		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);

		// nothing left over
		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>k0</b><b>k1</b>`);
	}
});
