import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>add</button><ul><li>1,2,3</li><li>1,2,3</li><li>text
		1,2,3</li><li>1,2,3</li><li>1,2,3</li><li title="1,2,3"></li><li title="1,2,3"></li><li><input readonly="" type="text"></li><li><input readonly="" type="text"></li></ul>
	`,

	ssrHtml: `
		<button>add</button><ul><li>1,2,3</li><li>1,2,3</li><li>text
		1,2,3</li><li>1,2,3</li><li>1,2,3</li><li title="1,2,3"></li><li title="1,2,3"></li><li><input readonly="" type="text" value="1,2,3"></li><li><input readonly="" type="text" value="1,2,3"></li></ul>
	`,

	test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button><ul><li>1,2,3</li><li>1,2,3,4</li><li>text
				1,2,3</li><li>1,2,3</li><li>1,2,3,4</li><li title="1,2,3"></li><li title="1,2,3,4"></li><li><input readonly="" type="text"></li><li><input readonly="" type="text"></li></ul>
			`
		);
	}
});
