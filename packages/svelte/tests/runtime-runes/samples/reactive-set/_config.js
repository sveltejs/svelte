import { flushSync } from '../../../../src/index-client';
import { ok, test } from '../../test';

export default test({
	html: `<button>delete initial</button><button>add</button><button>delete</button><button>clear</button><div id="output"><p>1</p><div>0</div></div>`,

	test({ assert, target }) {
		const [btn, btn2, btn3, btn4] = target.querySelectorAll('button');
		const output = target.querySelector('#output');
		ok(output);

		flushSync(() => btn?.click());
		assert.htmlEqual(output.innerHTML, `<p>0</p>`);

		flushSync(() => btn2?.click());
		assert.htmlEqual(output.innerHTML, `<p>1</p><div>1</div>`);

		flushSync(() => btn2?.click());
		flushSync(() => btn2?.click());
		assert.htmlEqual(output.innerHTML, `<p>3</p><div>1</div><div>2</div><div>3</div>`);

		flushSync(() => btn3?.click());
		assert.htmlEqual(output.innerHTML, `<p>2</p><div>1</div><div>2</div>`);

		flushSync(() => btn4?.click());
		assert.htmlEqual(output.innerHTML, `<p>0</p>`);
	}
});
