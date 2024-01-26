import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>0 - 0</p><button>+</button`,

	async test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `<p>1 - 1</p><button>+</button`);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `<p>2 - 2</p><button>+</button`);
	}
});
