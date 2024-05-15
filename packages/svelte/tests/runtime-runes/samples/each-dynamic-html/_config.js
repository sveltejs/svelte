import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<button>add item</button><button>make span</button><button>reverse</button>`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
			btn1?.click();
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add item</button><button>make span</button><button>reverse</button><div>Item 1</div><div>Item 2</div><div>Item 3</div>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add item</button><button>make span</button><button>reverse</button><span>Item 1</span><span>Item 2</span><span>Item 3</span>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add item</button><button>make span</button><button>reverse</button><span>Item 3</span><span>Item 2</span><span>Item 1</span>`
		);
	}
});
