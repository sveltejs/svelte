import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>update</button><p>3</p><p>2</p><p>1</p>`,

	async test({ target, assert }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());
		assert.htmlEqual(target.innerHTML, `<button>update</button><p>1</p><p>2</p><p>3</p>`);
	}
});
