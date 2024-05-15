import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<button>add</button><button>delete</button><button>clear</button>`,

	test({ assert, target }) {
		const [btn, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button><button>delete</button><button>clear</button><div>1:1</div>`
		);

		flushSync(() => {
			btn?.click();
		});

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button><button>delete</button><button>clear</button><div>1:1</div><div>2:2</div><div>3:3</div>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button><button>delete</button><button>clear</button><div>1:1</div><div>2:2</div>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button><button>delete</button><button>clear</button>`
		);
	}
});
