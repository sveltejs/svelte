import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [increment] = target.querySelectorAll('button');

		assert.deepEqual(logs, [false]);
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>0</p>');

		increment.click();
		await tick();
		assert.deepEqual(logs, [false]);
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>1</p>');

		increment.click();
		await tick();
		assert.deepEqual(logs, [false, true]);
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>2</p>');

		increment.click();
		await tick();
		assert.deepEqual(logs, [false, true]);
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>3</p>');
	}
});
