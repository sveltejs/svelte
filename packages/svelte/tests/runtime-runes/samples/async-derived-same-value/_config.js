import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true },
	async test({ assert, target, warnings }) {
		await tick();
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>1</button>');

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>1</button>');
		assert.deepEqual(warnings, []);
	}
});
