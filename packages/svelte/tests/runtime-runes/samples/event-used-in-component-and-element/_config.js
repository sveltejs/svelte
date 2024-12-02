import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>Count: 1</button><button>Increment</button>');

		b2?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>Count: 2</button><button>Increment</button>');
	}
});
