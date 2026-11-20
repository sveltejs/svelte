import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	server_props: { browser: false },
	props: { browser: true },
	async test({ assert, target, mod, hydrate, logs }) {
		// The state is written in the root component's script while hydrating (see
		// async-hydration-pending-boundary-state for state written before `hydrate()`)
		hydrate();
		await tick();
		await tick();

		const initial_logs = logs.slice();

		mod.slow.resolve('loaded');
		await tick();
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>loaded</p><p>ada ada</p>');
		assert.deepEqual(initial_logs, ['ada', 'ada']);
		assert.deepEqual(logs, ['ada', 'ada']);
	}
});
