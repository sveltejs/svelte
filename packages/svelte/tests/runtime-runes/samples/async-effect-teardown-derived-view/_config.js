import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>start</button><button>hide</button><button>resolve</button>';

// The pending `x` update also evaluates `double` in the latest state. An independent
// batch hides the child before that update commits, so its teardown must see both
// values from the committed view, rather than the derived's newer cached value.
export default test({
	async test({ assert, target, logs }) {
		const [start, hide, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>child</p>`);
		assert.deepEqual(logs, ['setup: x=0 double=0']);

		start.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>child</p>`);
		assert.deepEqual(logs, ['setup: x=0 double=0', 'latest: 2']);

		hide.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);
		assert.deepEqual([...logs], ['setup: x=0 double=0', 'latest: 2', 'teardown: x=0 double=0']);
	}
});
