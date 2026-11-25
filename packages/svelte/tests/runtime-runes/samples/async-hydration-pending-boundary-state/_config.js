import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	server_props: { browser: false },
	props: { browser: true },
	async test({ assert, target, mod, hydrate, logs }) {
		// SvelteKit initializes page state immediately before hydrating the component.
		mod.state.id = 'ada';
		hydrate();
		await tick();
		await tick();

		assert.deepEqual(logs, ['ada', 'ada']);

		mod.slow.resolve('loaded');
		await tick();
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>loaded</p><p>const: ada</p><p>script: ada</p>');
		assert.deepEqual(logs, ['ada', 'ada']);

		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>loaded</p><p>const: grace</p><p>script: grace</p>');
		assert.deepEqual(logs, ['ada', 'ada', 'grace', 'grace']);
	}
});
