import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>show</button>
	<button>update</button>
	<button>value</button>
	<button>gate</button>
	<button>obsolete</button>
`;

// The first thunk, not just later ones, must hand `run` the batch that supplies its value.
// Keep that batch uncommitted so a continuation in the creator's view would read the old prop.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show, update, value, gate, obsolete] = target.querySelectorAll('button');

		show.click();
		await tick();
		update.click();
		await tick();

		value.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 2 2']);

		gate.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p><span>2</span>`);

		obsolete.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p><span>2</span>`);
		assert.deepEqual(logs, []);
	}
});
