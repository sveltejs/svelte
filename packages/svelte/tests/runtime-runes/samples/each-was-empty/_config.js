import { flushSync } from 'svelte';
import { test } from '../../test';

// https://github.com/sveltejs/svelte/issues/13550
// https://github.com/sveltejs/svelte/pull/13553
export default test({
	html: `<button>clicks: 0</button><button>undefined</button><button>null</button><button>empty</button><button>[1,2,3]</button><ul><li>count = <span>0</span></li></ul>`,

	async test({ assert, target }) {
		const [increment, set_undefined, set_null, set_empty, set_list] =
			target.querySelectorAll('button');

		let [span] = target.querySelectorAll('span');

		// initial value
		assert.exists(span);
		assert.equal(span.innerHTML, '0');

		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '1');

		// change collection to undefined
		flushSync(() => set_undefined.click());
		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '2');

		// change collection to null
		flushSync(() => set_null.click());
		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '3');

		// change collection to empty
		flushSync(() => set_empty.click());
		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '4');

		// change collection to undefined
		flushSync(() => set_undefined.click());
		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '5');

		// change collection to [1,2,3]
		flushSync(() => set_list.click());
		[span] = target.querySelectorAll('span');
		assert.notExists(span);
		assert.equal(target.querySelectorAll('li').length, 3);

		// change collection to undefined
		flushSync(() => set_undefined.click());
		[span] = target.querySelectorAll('span');
		assert.exists(span);
		assert.equal(span.innerHTML, '5');

		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '6');

		// change collection to null
		flushSync(() => set_null.click());
		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '7');

		// change collection to empty
		flushSync(() => set_empty.click());
		// increment value
		flushSync(() => increment.click());
		assert.equal(span.innerHTML, '8');

		assert.htmlEqual(
			target.innerHTML,
			`<button>clicks: 8</button><button>undefined</button><button>null</button><button>empty</button><button>[1,2,3]</button><ul><li>count = <span>8</span></li></ul>`
		);
	}
});
