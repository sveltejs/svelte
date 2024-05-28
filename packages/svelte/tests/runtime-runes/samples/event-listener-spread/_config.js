import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>clicks: 1</button>');
	}
});
