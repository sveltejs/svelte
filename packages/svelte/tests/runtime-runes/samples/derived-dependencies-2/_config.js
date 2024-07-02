import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		let [btn1, btn2] = target.querySelectorAll('button');

		btn1?.click();
		flushSync();
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<button>hide</button><button>show</button`);

		btn2?.click();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`<h1>John Doe</h1><p>Body</p><div>123</div><button>hide</button><button>show</button>`
		);

		btn1?.click();
		flushSync();
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<button>hide</button><button>show</button`);

		btn2?.click();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`<h1>John Doe</h1><p>Body</p><div>123</div><button>hide</button><button>show</button>`
		);
	}
});
