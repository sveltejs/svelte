import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>false</button><button>false</button><button>false</button><button>false</button>`,
	test({ assert, target }) {
		const [button1, button2, button3, button4] = target.querySelectorAll('button');

		button1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>true</button><button>false</button><button>false</button><button>false</button>`
		);

		button2.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>true</button><button>true</button><button>false</button><button>false</button>`
		);

		button3.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>true</button><button>true</button><button>true</button><button>false</button>`
		);

		button4.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>true</button><button>true</button><button>true</button><button>true</button>`
		);
	}
});
