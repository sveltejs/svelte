import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const thing = /** @type HTMLElement & { object: { test: true }; } */ (
			target.querySelector('my-thing')
		);

		await tick();

		assert.include(thing.shadowRoot?.innerHTML, 'red');
	}
});
