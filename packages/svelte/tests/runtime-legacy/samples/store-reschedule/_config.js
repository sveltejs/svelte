import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button>`,

	test({ assert, target }) {
		const [button1, button2] = target.querySelectorAll('button');

		flushSync(() => button1.click());
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>1</button>`);

		flushSync(() => button1.click());
		assert.htmlEqual(target.innerHTML, `<button>2</button><button>2</button>`);

		flushSync(() => button2.click());
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>1</button>`);

		flushSync(() => button2.click());
		assert.htmlEqual(target.innerHTML, `<button>2</button><button>2</button>`);
	}
});
