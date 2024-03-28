import { flushSync } from 'svelte';
import { test } from '../../test';
import { log } from './log.js';

export default test({
	html: '<button>1 / 1</button>',

	before_test() {
		log.length = 0;
	},

	test({ assert, target }) {
		assert.deepEqual(log, [2, 1]);

		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.deepEqual(log, [2, 1, 2, 1]);

		assert.htmlEqual(target.innerHTML, '<button>3 / 2</button>');
	}
});
