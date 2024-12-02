import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>set</button><button>delete</button><p>a,b,c</p><p>{"a":1,"b":2,"c":3}</p>',
	test({ assert, target }) {
		const [btn, bt2] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set</button><button>delete</button><p>a,b,c</p><p>{"a":1,"b":2,"c":3}</p>`
		);

		flushSync(() => {
			bt2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set</button><button>delete</button><p>a,c</p><p>{"a":1,"c":3}</p>`
		);
	}
});
