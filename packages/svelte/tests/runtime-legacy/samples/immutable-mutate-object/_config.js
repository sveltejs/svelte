import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	immutable: true,

	html: '<button>0</button> <button>0</button>',

	test({ assert, target }) {
		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>0</button> <button>0</button>');

		button2.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>2</button> <button>2</button>');
	}
});
