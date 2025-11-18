import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	test({ assert, raf, target }) {
		const [x, y] = target.querySelectorAll('button');

		// Set second part of condition to false first...
		y.click();
		flushSync();
		raf.tick(50);
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle x</button> <button>toggle y</button> <p foo="0.5">hello</p>'
		);

		// ...so that when both are toggled the block condition runs again
		x.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle x</button> <button>toggle y</button> <p foo="0.5">hello</p>'
		);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<button>toggle x</button> <button>toggle y</button>');
	}
});
