import { flushSync } from 'svelte';
import { test } from '../../test';

// https://github.com/sveltejs/svelte/issues/13550
// https://github.com/sveltejs/svelte/pull/13553
export default test({
	html: `<button>clicks: 0</button><button>undefined</button><button>null</button><button>empty</button><button>[1,2,3]</button><ul><li>count = <span>0</span></li></ul>`,

	async test({ assert, target }) {
		const [ increment, set_undefined, set_null, set_empty, set_list ] = target.querySelectorAll('button');
		
		const [ span ] = target.querySelectorAll("span");

		let count = 0;
		assert.equal(span.innerHTML, `${count}`);

		for (const button of [set_undefined, set_null, set_empty, set_undefined, set_null, set_empty]) {
			flushSync(() => {
				button.click();
			});
			flushSync(() => {
				increment.click();
				count++;
			});
			assert.equal(span.innerHTML, `${count}`);
		}

		flushSync(() => {
			set_list.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>clicks: ${count}</button><button>undefined</button><button>null</button><button>empty</button><button>[1,2,3]</button><ul><li>item : 1</li><li>item : 2</li><li>item : 3</li></ul>`
		);
	}
});
