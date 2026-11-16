import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>y 1</button>
	<button>v 2</button>
`;

// B creates the component, inside a boundary that shows its pending snippet, so B doesn't wait for the script.
// B intersects A, which is still waiting for other work, so B is merged into it while the script waits. The script
// then continues in A, the batch that B became part of, once that has a value
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, y1, v2] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['y 1']);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['v 2']);

		v2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 2']);

		y1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>2</span>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
