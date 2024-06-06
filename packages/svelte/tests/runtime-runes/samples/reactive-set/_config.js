import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<button>delete initial</button><button>add</button><button>delete</button><button>clear</button><div>0</div>`,

	test({ assert, target }) {
		const [btn, btn2, btn3, btn4] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>delete initial</button><button>add</button><button>delete</button><button>clear</button>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>delete initial</button><button>add</button><button>delete</button><button>clear</button><div>1</div>`
		);

		flushSync(() => {
			btn2?.click();
		});

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>delete initial</button><button>add</button><button>delete</button><button>clear</button><div>1</div><div>2</div><div>3</div>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>delete initial</button><button>add</button><button>delete</button><button>clear</button><div>1</div><div>2</div>`
		);

		flushSync(() => {
			btn4?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>delete initial</button><button>add</button><button>delete</button><button>clear</button>`
		);
	}
});
