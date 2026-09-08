import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>update</button>
	<button>resolve</button>
	<button>discard</button>
`;

export default test({
	async test({ assert, target, instance }) {
		const [fork_button, update, resolve, discard] = target.querySelectorAll('button');

		fork_button.click();
		await tick();
		assert.equal(instance.get_calls(), 1);
		assert.htmlEqual(target.innerHTML, buttons);

		// Transfer an invalidation into the fork while its async work is pending.
		update.click();
		await tick();
		assert.equal(instance.get_calls(), 1); // can also be 2 at this point already, would also be ok

		try {
			resolve.click();
			await tick();
			assert.equal(instance.get_calls(), 2);

			// Completing the replacement must not replay the same invalidation.
			resolve.click();
			await tick();
			assert.equal(instance.get_calls(), 2);
		} finally {
			discard.click();
			await tick();
		}

		assert.htmlEqual(target.innerHTML, buttons);
	}
});
