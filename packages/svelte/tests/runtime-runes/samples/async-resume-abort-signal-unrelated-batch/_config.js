import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
`;

// Like `async-resume-unrelated-batch`, with `getAbortSignal`: B doesn't run the expression, so it doesn't abort
// A's run, whose result the content is created with.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs, ['load 1']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs, ['load 1']);
	}
});
