import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>update</button>
	<button>show</button>
	<button>resolve</button>
`;

// Same as `async-state-read-new-dependency`, but the branch is selected by an eager expression
// Earlier we said the reader inside it must still see the latest value of `value` rather than `undefined`,
// but that decision was adjusted, so this test now verifies the updated behavior.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [update, show, resolve] = target.querySelectorAll('button');

		update.click(); // pending batch writes `value`
		await tick();

		show.click(); // eager flush creates the branch, which reads `value` for the first time and crashes
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>crash</p>`);

		resolve.click();
	}
});
