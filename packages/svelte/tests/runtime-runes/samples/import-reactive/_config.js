import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>1</button> <button>2</button> <p>1</p>',

	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn2.click());
		assert.htmlEqual(target.innerHTML, `<button>1</button> <button>2</button> <p>2</p>`);

		// reset state for next variant
		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, `<button>1</button> <button>2</button> <p>1</p>`);
	}
});
