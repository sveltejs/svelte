import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');

		flushSync(() => {
			btn.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			'<button>Shuffle</button> <br> <b>5</b><b>1</b><b>4</b><b>2</b><b>3</b> <br> 51423'
		);
	}
});
