import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			'<button>add</button><p>1</p><p>2</p><p>3</p><p>4</p><p>0</p>'
		);
	}
});
