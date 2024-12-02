import { flushSync } from 'svelte';
import { test } from '../../test';
import state from './state.js';

export default test({
	html: '<button>0</button>',

	before_test() {
		state.count = 0;
	},

	test({ assert, target }) {
		const button = target.querySelector('button');
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, '<button>0</button>');
	}
});
