import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true },
	async test({ assert, target, logs }) {
		await settled();
		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();
		await settled();

		assert.htmlEqual(target.innerHTML, `<button>run</button><p>other 1</p><p>loaded 1</p>`);
		assert.deepEqual(logs, ['effect ran']);
	}
});
