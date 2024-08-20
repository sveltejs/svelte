import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button><button>false</button>`,

	test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => btn1.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button><button>1</button><button>false</button>`
		);

		flushSync(() => btn2.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button><button>2</button><button>false</button>`
		);

		flushSync(() => btn3.click());
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>2</button><button>true</button>`);

		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, `<button>2</button><button>2</button><button>true</button>`);

		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, `<button>3</button><button>2</button><button>true</button>`);

		flushSync(() => btn1.click());
		flushSync(() => btn3.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>4</button><button>4</button><button>false</button>`
		);
	}
});
