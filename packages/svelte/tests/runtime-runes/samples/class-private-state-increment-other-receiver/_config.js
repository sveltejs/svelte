import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>1</button><button>drop</button>`,

	test({ assert, target }) {
		const [bump, drop] = target.querySelectorAll('button');

		bump?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>2</button><button>drop</button>`);

		bump?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>3</button><button>drop</button>`);

		drop?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>2</button><button>drop</button>`);
	}
});
