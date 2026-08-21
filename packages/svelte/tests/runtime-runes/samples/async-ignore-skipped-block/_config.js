import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [a, b] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<button>a 0</button><button>b 0</button><p>hello</p>`);

		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>a 0</button><button>b 0</button><p>hello</p>`);

		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>a 2</button><button>b 0</button><p>hello</p>`);

		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>a 2</button><button>b 0</button><p>hello</p>`);

		// if we don't skip over the never-resolving promise in the `else` block, we will never update
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>a 3</button><button>b 1</button><p>hello</p>`);
	}
});
