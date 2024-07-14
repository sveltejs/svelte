import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button><div>0:0</div>`,

	test({ assert, target }) {
		const [btn, btn2, btn3, btn4, btn5] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button><div>0:1</div>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button><div>0:0</div>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button><div>0:0</div><div>2:2</div>`
		);

		flushSync(() => {
			btn3?.click();
		});

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button><div>0:0</div><div>2:2</div><div>3:3</div><div>4:4</div>`
		);

		flushSync(() => {
			btn4?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button><div>0:0</div><div>2:2</div><div>3:3</div>`
		);

		flushSync(() => {
			btn5?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>set if</button><button>set if 1</button><button>add</button><button>delete</button><button>clear</button>`
		);
	}
});
