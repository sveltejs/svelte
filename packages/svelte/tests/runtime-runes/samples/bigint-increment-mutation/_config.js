import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>mutate</button><button>reassign</button><p>0</p>',
	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, '<button>mutate</button><button>reassign</button><p>1</p>');

		flushSync(() => btn2.click());
		assert.htmlEqual(target.innerHTML, '<button>mutate</button><button>reassign</button><p>0</p>');
	}
});
