import { flushSync } from 'svelte';
import { test } from '../../test';
import { store } from './state.js';

export default test({
	html: '<p>0</p><button>1</button>',

	before_test() {
		store.set({ value: 0 });
	},

	async test({ assert, target }) {
		const button = target.querySelector('button');
		flushSync(() => button?.click());

		assert.htmlEqual(target.innerHTML, '<p>1</p><button>1</button>');
	}
});
