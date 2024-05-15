import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>1 / 1</button>',

	test({ assert, target, logs }) {
		assert.deepEqual(logs, [2, 1]);

		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.deepEqual(logs, [2, 1, 2, 1]);

		assert.htmlEqual(target.innerHTML, '<button>3 / 2</button>');
	}
});
