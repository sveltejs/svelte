import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>count</button>
	<button>eager</button>
	<button>plain</button>
	<button>shift</button>
`;

// Reading a value via `$state.eager` sees the latest value and does not connect the batch
// to the (pending) batch that wrote it, unlike a regular read, which has to wait for it
export default test({
	async test({ assert, target }) {
		await tick();
		const [count, eager, plain, shift] = target.querySelectorAll('button');

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		eager.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>1</span>`);

		plain.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>1</span>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>1</span><b>1</b>`);
	}
});
