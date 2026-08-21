import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		await tick();

		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>clicks: 1</button>');
		assert.deepEqual(warnings, [
			'Mutating unbound props (`object`, at Child.svelte:7:23) is strongly discouraged. Consider using `bind:object={...}` in main.svelte (or using a callback) instead'
		]);
	}
});
