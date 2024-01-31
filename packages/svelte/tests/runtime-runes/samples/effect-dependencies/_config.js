import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div><button>A</button><button>B</button></div><div>A</div>`
		);

		flushSync(() => {
			b2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div><button>A</button><button>B</button></div><div>B\n12</div>`
		);

		flushSync(() => {
			b1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div><button>A</button><button>B</button></div><div>A</div>`
		);

		flushSync(() => {
			b2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div><button>A</button><button>B</button></div><div>B\n12</div>`
		);

		flushSync(() => {
			b1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div><button>A</button><button>B</button></div><div>A</div>`
		);
	}
});
