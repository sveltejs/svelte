import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>first 1</button>
	<button>first 2</button>
	<button>second 2</button>
`;

// Like `async-resume-script-later-batch`, but the second `await` requests an abort signal.
// B supersedes A's pending second run, so it merges into A before either replacement result arrives.
// Resolving the second result resumes the script with the first value it already received;
// the replacement first result still holds up the DOM commit.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, first_2, second_2] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 1']);

		// A's first result: the script continues in A's view
		first_1.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['second 1']);

		// B reveals the component, too, and runs both expressions. Its second run aborts A's
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['first 2', 'aborted second 1', 'second 2']);

		// The second result resumes the script in the merged view, with the original first value.
		second_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 1 2']);

		// The replacement first result updates the derived, allowing the merged batch to commit.
		first_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
