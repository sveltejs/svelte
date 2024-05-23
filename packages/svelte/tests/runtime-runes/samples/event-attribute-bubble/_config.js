import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button><button>change handler</button>`,

	test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			'<button>1</button><button>1</button><button>change handler</button>'
		);

		flushSync(() => {
			b2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			'<button>2</button><button>2</button><button>change handler</button>'
		);

		flushSync(() => {
			b3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			'<button>2</button><button>2</button><button>change handler</button>'
		);

		flushSync(() => {
			b1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			'<button>1</button><button>1</button><button>change handler</button>'
		);

		flushSync(() => {
			b2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			'<button>0</button><button>0</button><button>change handler</button>'
		);
	}
});
