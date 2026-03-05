import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>clear</button><div><p>hello</p></div>',

	async test({ assert, target, raf, logs }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());
		assert.deepEqual(logs, ['hello']);

		// Let the transition finish and clean up
		raf.tick(100);

		assert.htmlEqual(target.innerHTML, '<button>clear</button>');
	}
});
