import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>shift</button>
	<button>pop</button>
`;

// A boundary with a `failed` snippet, inside a boundary that shows its pending snippet. The inner one fails
// (a rejected `await` in a component's script) while a template expression inside it is still pending. Its
// content is destroyed outside of a flush, which must still release the outer boundary
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [, pop] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		// the script's `await` rejects, 'slow' is still pending
		pop.click();
		await tick();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>failed: oops</p>`);
	}
});
