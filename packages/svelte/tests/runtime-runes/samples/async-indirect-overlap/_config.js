import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>a</button> <button>b</button> <button>shift</button> <button>pop</button>';

export default test({
	async test({ assert, target }) {
		await tick();

		const [a, b, shift, pop] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// start two independent batches, both blocked on their awaited expression
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// resolve the newer (b) batch first. Since it ran with the latest a value, it can resolve both
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);
	}
});
