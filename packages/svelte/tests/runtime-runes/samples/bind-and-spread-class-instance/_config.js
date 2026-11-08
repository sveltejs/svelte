import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button><p>accessor: 0 field: 0</p>`,

	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button><button>0</button><p>accessor: 1 field: 0</p>`
		);

		flushSync(() => btn2?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button><button>1</button><p>accessor: 1 field: 1</p>`
		);
	}
});
