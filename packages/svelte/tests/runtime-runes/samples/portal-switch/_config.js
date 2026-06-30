import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<div>on page A</div> <button>switch page</button> <p>contents of page A</p>',
	test({ assert, target }) {
		const [toggle] = target.querySelectorAll('button');

		toggle.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<div>on page B</div> <button>switch page</button> <p>contents of page B</p>');
	}
});
