import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>0</button><button>0</button><button>cleanup</button>',

	async test({ assert, target, logs }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
			b2.click();
		});

		assert.deepEqual(logs, [0, 1]);

		flushSync(() => {
			b3.click();
		});

		assert.deepEqual(logs, [0, 1, 'cleanup 1', 'cleanup 2']);

		flushSync(() => {
			b1.click();
			b2.click();
		});

		assert.deepEqual(logs, [0, 1, 'cleanup 1', 'cleanup 2']);
	}
});
