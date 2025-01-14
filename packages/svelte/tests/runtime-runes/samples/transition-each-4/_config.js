import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	async test({ assert, raf, target, logs }) {
		assert.htmlEqual(
			target.innerHTML,
			'<button>Toggle</button><div><div>1</div><div>2</div><div>3</div></div>'
		);

		const btn1 = target.querySelector('button');
		btn1?.click();
		flushSync();
		raf.tick(250);

		assert.htmlEqual(
			target.innerHTML,
			'<button>Toggle</button><div style="opacity: 0.5;"><div>1</div><div>2</div><div>3</div></div>'
		);

		logs.length = 0;

		await Promise.resolve();

		flushSync();
		raf.tick(500);

		assert.htmlEqual(
			target.innerHTML,
			'<button>Toggle</button><div style=""><div>3</div><div>4</div></div>'
		);

		assert.deepEqual(logs, ['$effect.pre', '$effect.pre', '$effect', '$effect']);
	}
});
