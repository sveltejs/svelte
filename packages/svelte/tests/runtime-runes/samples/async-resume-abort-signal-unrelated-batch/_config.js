import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
	<button>pop</button>
`;

// Like `async-resume-unrelated-batch`, with `getAbortSignal`: B's run of the expression must not keep A's
// from settling, as the content is created with A's result, and B waits for that
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [a, b, shift, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		// B's run
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		// A's (re)run
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
	}
});
