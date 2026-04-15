import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	html: '<div>true false false</div><button>true 0</button>',

	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(target.innerHTML, '<div>true false false</div><button>true 1</button>');
	}
});
