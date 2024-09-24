import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	test({ assert, raf, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1?.click();
		btn1?.click();
		btn1?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>Push</button><button>Remove</button><ul><li>0</li><li>1</li><li>2</li></ul'
		);

		btn2?.click();
		flushSync();
		raf.tick(50);

		const li = /** @type {HTMLElement & { foo: number }} */ (target.querySelector('ul > li'));

		assert.equal(li.foo, 0.5);

		btn1?.click();
		flushSync();

		assert.equal(li.foo, 0.5);
		assert.htmlEqual(
			target.innerHTML,
			'<button>Push</button><button>Remove</button><ul><li>0</li><li>1</li><li>2</li><li>3</li></ul'
		);
	}
});
