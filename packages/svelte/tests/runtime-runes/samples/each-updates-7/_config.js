import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<ul><li>test (1)</li> <span style="background-color: red; width: 20px; height: 20px; display: inline-block;"></span><li>test 2 (2)</li><li>test 3 (3)</li></ul><button>Swap items 1 &amp; 3</button>`,

	async test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		flushSync(() => {
			btn1.click();
		});

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<ul><li>test (1)</li><span style="background-color: red; width: 20px; height: 20px; display: inline-block;"></span><li>test 2 (2)</li><li>test 3 (3)</li></ul><button>Swap items 1 &amp; 3</button>`
		);
	}
});
