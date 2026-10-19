import { tick } from 'svelte';
import { test } from '../../test';

// The eager expression is created while the earlier batch is processed, in whose view `x` is
// still 0. It reads the real (latest) value nonetheless, so it should not be re-run later on
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [a, x, shift] = target.querySelectorAll('button');

		a.click();
		await tick();
		x.click();
		await tick();
		assert.deepEqual(logs, []);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>a</button><button>x</button><button>shift</button><p>1</p><span>0</span>'
		);
		assert.deepEqual(logs, [1]);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>a</button><button>x</button><button>shift</button><p>1</p><span>1</span>'
		);
		assert.deepEqual(logs, [1]);
	}
});
