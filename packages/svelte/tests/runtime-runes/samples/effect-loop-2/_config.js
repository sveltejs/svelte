import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: 'Over\n10\n<br><button>increment</button><br><button>reset</button>',
	ssrHtml: '0\n<br><button>increment</button><br><button>reset</button>',

	async test({ assert, target, component }) {
		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			'Over\n10\n<br><button>increment</button><br><button>reset</button>'
		);
	}
});
