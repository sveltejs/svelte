import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>first 1</button>
	<button>first 2</button>
	<button>second 2</button>
`;

// B supersedes A's pending abortable second run immediately. B still advances
// through its own first checkpoint before starting its second await, so its
// continuation must observe a coherent 2/2 rather than shared first value 1.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, first_2, second_2] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 1']);

		first_1.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['second 1']);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['first 2', 'aborted second 1']);

		first_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['second 2']);

		second_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
		assert.deepEqual(logs.splice(0), ['continued with 2 2']);
	}
});
