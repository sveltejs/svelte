import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>a</button><button>b</button><button>shift</button><button>pop</button>';

// The two batches only share a block (not a source, or an async expression), so they're unrelated: neither
// sees the other's write, and they can commit in any order. Whichever commits last must select the branch
// again, though, because the other one's write is part of its view now
export default test({
	async test({ assert, target }) {
		await tick();
		const [a, b, shift, pop] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p><p>same</p>`);

		// the later batch commits first
		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p><p>same</p>`);

		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 1</p><p>different</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p><p>same</p>`);

		// the earlier batch commits first
		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p><p>same</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 1</p><p>different</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p><p>same</p>`);
	}
});
