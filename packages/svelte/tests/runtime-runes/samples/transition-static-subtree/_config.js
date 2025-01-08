import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	async test({ assert, raf, target }) {
		assert.htmlEqual(target.innerHTML, '<button>Toggle</button><div><span>123</span></div>');

		const btn1 = target.querySelector('button');
		btn1?.click();
		flushSync();
		raf.tick(250);

		assert.htmlEqual(
			target.innerHTML,
			'<button>Toggle</button><div><span style="opacity: 0.5;">123</span></div>'
		);

		flushSync();
		raf.tick(500);

		assert.htmlEqual(target.innerHTML, '<button>Toggle</button>');
	}
});
