import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0 / 0</button><button>0 / 0</button>`,

	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>1 / 0</button><button>1 / 0</button>`);

		btn2?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>2 / 1</button><button>2 / 1</button>`);
	}
});
