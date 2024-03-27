import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	html: `<p>test costs $1</p><p>test 2 costs $2</p><p>test costs $1</p><p>test 2 costs $2</p><button>add</button><button>change</button><button>reload</button>`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<p>test costs $1</p><p>test 2 costs $2000</p><p>test costs $1</p><p>test 2 costs $2000</p><button>add</button><button>change</button><button>reload</button>`
		);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<p>test costs $1</p><p>test 2 costs $2000</p><p>test 3 costs $3</p><p>test costs $1</p><p>test 2 costs $2000</p><p>test 3 costs $3</p><button>add</button><button>change</button><button>reload</button>`
		);

		flushSync(() => {
			btn3.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<p>test costs $1</p><p>test 2 costs $2</p><p>test costs $1</p><p>test 2 costs $2</p><button>add</button><button>change</button><button>reload</button>`
		);
	}
});
