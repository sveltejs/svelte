import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<div></div><button>set_action1</button><button>set_action2</button><button>set_null</button><button>increment</button>`,

	async test({ assert, target }) {
		const [div] = target.querySelectorAll('div');
		const [set_action1, set_action2, set_null, increment] = target.querySelectorAll('button');

		assert.equal(div.innerText, undefined);

		flushSync(() => set_action1.click());
		assert.equal(div.innerText, 'action1 value=0');

		flushSync(() => increment.click());
		assert.equal(div.innerText, 'action1 updated=1');

		flushSync(() => set_null.click());
		assert.equal(div.innerText, 'action1 destroyed');

		flushSync(() => set_action2.click());
		assert.equal(div.innerText, '1');

		flushSync(() => increment.click());
		assert.equal(div.innerText, '2');

		flushSync(() => set_null.click());
		assert.equal(div.innerText, '');

		flushSync(() => increment.click());
		assert.equal(div.innerText, '');

		flushSync(() => set_action1.click());
		assert.equal(div.innerText, 'action1 value=3');

		flushSync(() => increment.click());
		assert.equal(div.innerText, 'action1 updated=4');

		flushSync(() => set_action1.click());
		assert.equal(div.innerText, 'action1 updated=4');

		flushSync(() => increment.click());
		assert.equal(div.innerText, 'action1 updated=5');

		flushSync(() => set_action2.click());
		assert.equal(div.innerText, '5');
	}
});
