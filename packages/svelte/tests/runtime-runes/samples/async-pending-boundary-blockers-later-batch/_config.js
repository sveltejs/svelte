import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>show</button>
	<button>shift</button>
`;

// A later batch creates a template expression that waits for a component's script (blockers) before it runs
// its `await`, inside a boundary that shows its pending snippet. The batch must stay around until the
// blockers are done: the expression runs in it then, and its result must resolve the boundary
export default test({
	mode: ['client'],
	solo: true,
	async test({ assert, target }) {
		const [show, shift] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		// the script's `await`
		shift.click();
		await tick();

		// the template expression
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>data!</p>`);
	}
});
