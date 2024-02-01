import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>Add Item</button>`,

	async test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add Item</button><button>Index 0\n|\nItem 0</button><button>Index 1\n|\nItem 1</button>`
		);

		let [btn2, btn3, btn4] = target.querySelectorAll('button');

		flushSync(() => {
			btn4.click();
			btn3.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Add Item</button>`);

		let [btn5] = target.querySelectorAll('button');

		flushSync(() => {
			btn5.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add Item</button><button>Index 0\n|\nItem 2</button>`
		);
	}
});
