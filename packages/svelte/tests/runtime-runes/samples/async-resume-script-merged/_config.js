import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>y 1</button>
	<button>v 2</button>
`;

// B creates the component inside a pending boundary, so it doesn't wait for the script.
// Its writes intersect A's, so B merges into A while A waits for other work.
// When the script's value arrives, the script must continue in A.
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
