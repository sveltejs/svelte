import { tick } from 'svelte';
import { test } from '../../test';

// An effect that several batches scheduled must run in each of them, even if another batch is flushed first
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [a, b, resolve_and_write, resolve] = target.querySelectorAll('button');
		const buttons =
			'<button>a</button><button>b</button><button>resolve and write</button><button>resolve</button>';
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p><i>0</i><span>0</span>`);

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p><i>0</i><span>0</span>`);

		resolve_and_write.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 1</p><i>0</i><span>1</span>`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p><i>1</i><span>1</span>`);
	}
});
