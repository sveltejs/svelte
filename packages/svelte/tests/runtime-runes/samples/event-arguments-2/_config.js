import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button>`,

	test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');

		b1?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>1</button>');
	}
});
