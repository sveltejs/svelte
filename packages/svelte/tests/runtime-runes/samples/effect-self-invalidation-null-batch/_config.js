import { ok, test } from '../../test';

// https://github.com/sveltejs/svelte/issues/18850
// `schedule_effect` dereferenced a null `current_batch` when a `$effect`
// wrote a source that became one of its dependencies in the same run
// and then called `flushSync()` during a batch flush.
export default test({
	async test({ assert, target }) {
		const button = target.querySelector('button');
		ok(button);

		button.click();
		// the batch (and the child's first effect run) flushes in a microtask
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, '<button>Mount the child</button> <p>x = 1</p>');
	}
});
