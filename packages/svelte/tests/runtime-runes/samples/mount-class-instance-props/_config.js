import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`<div><button>0</button></div><div><button>0</button></div><p>accessor: 0 field: 0</p>`
		);

		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<div><button>1</button></div><div><button>0</button></div><p>accessor: 1 field: 0</p>`
		);

		flushSync(() => btn2?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<div><button>1</button></div><div><button>1</button></div><p>accessor: 1 field: 1</p>`
		);
	}
});
