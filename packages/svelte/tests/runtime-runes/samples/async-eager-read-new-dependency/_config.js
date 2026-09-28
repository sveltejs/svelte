import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>update</button>
	<button>show</button>
	<button>resolve</button>
`;

// Same as `async-state-read-new-dependency`, but the branch is selected by an eager
// expression: the eager batch hides every other batch's writes, so a newly created
// reader inside it must still see the latest value of `value` rather than `undefined`
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [update, show, resolve] = target.querySelectorAll('button');

		update.click(); // pending batch writes `value`
		await tick();

		show.click(); // eager flush creates the branch, which reads `value` for the first time
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);
	}
});
