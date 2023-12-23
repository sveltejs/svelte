import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>push</button><button>pop</button><p>1</p><p>2</p><p>3</p>`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>push</button><button>pop</button><p>1</p><p>2</p><p>3</p><p>4</p>`
		);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>push</button><button>pop</button><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>`
		);

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>push</button><button>pop</button><p>1</p><p>2</p><p>3</p><p>4</p>`
		);

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>push</button><button>pop</button><p>1</p><p>2</p><p>3</p>`
		);

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>push</button><button>pop</button><p>1</p><p>2</p>`);
	}
});
