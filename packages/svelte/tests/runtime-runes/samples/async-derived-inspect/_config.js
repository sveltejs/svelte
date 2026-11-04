import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true },
	async test({ assert, target, logs }) {
		await tick();
		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>4</button>');
		assert.deepEqual(logs, [
			'v',
			'init',
			2,
			'doubled',
			'init',
			4,
			'v',
			'update',
			4,
			'doubled',
			'update',
			8
		]);
	}
});
