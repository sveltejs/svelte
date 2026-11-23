import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	async test({ assert, target, errors }) {
		await tick();
		const [increment, update, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();

		resolve.click();
		await tick();

		update.click();
		await tick();

		resolve.click();
		await tick();

		assert.deepEqual(
			errors.filter((error) => error.includes('state_unsafe_mutation')),
			[]
		);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>update</button>
				<button>resolve</button>
				<p>count: 1</p>	
				<p>submits: 1</p>	
				<p>pending: 0</p>	
				<p>2</p>	
			`
		);
	}
});
