import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const buttons = target.querySelectorAll('button');

		buttons.forEach((b) => b.click());
		flushSync();
		buttons.forEach((b) => b.click());
		flushSync();
		buttons.forEach((b) => b.click());
		flushSync();
		assert.deepEqual(logs, [true, true, 'mutated', 'mutated', 'assigned', 'assigned']);
		assert.htmlEqual(target.innerHTML, '<button>a</button><button>b</button><button>next</button>');
	}
});
