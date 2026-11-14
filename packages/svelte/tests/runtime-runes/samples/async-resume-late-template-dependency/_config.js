import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>update</button>
	<button>first</button>
	<button>blocker</button>
	<button>second</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [update, first, blocker, second] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i><b>0</b><span>pending</span>`);

		// A writes x before the older batch's template expression has read it, then waits on y.
		update.click();
		await tick();

		// B resumes without being processed, reads x=0 in its view, and suspends again.
		// This is a template expression, so run()'s final branch sweep cannot help.
		first.click();
		await tick();

		// A must revalidate its writes even though it is still the last batch that was processed.
		blocker.click();
		await tick();
		second.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<i>1</i><b>1</b><p>1</p>`);
	}
});
