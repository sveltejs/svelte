import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>show</button>
	<button>shift</button>
`;

// The writes of a batch that committed while it still has work in flight inside a boundary that
// shows its pending snippet (which doesn't block it) aren't undone in the views of later batches
export default test({
	async test({ assert, target, logs }) {
		const [a, show, shift] = target.querySelectorAll('button');

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a: 0</p> <p>loading...</p>`);
		assert.deepEqual(logs, ['push']);

		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a: 1</p> <p>loading...</p>`);
		assert.deepEqual(logs, ['push']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a: 1</p> <p>content: done</p>`);
	}
});
