import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<nav><ul><button>Tab 1</button><button>Tab 2</button><button>Tab 3</button></ul></nav> <h1>Tab 1</h1>`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		btn2.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<nav><ul><button>Tab 1</button><button>Tab 2</button><button>Tab 3</button></ul></nav> <h1>Tab 2</h1>`
		);

		btn3.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<nav><ul><button>Tab 1</button><button>Tab 2</button><button>Tab 3</button></ul></nav> <h1>Tab 3</h1>`
		);

		btn1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<nav><ul><button>Tab 1</button><button>Tab 2</button><button>Tab 3</button></ul></nav> <h1>Tab 1</h1>`
		);
	}
});
