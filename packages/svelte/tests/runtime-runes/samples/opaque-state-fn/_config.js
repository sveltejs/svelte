import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>0</p><button>+1</button>`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<p>1</p><button>+1</button>`);

		button?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<p>2</p><button>+1</button>`);
	}
});
