import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>discard</button>
	<button>a0</button>
	<button>a1</button>
	<button>ba0</button>
	<button>ba1</button>
`;

// A fork creates a component with two `await`s in its script, and a real batch reveals it. The fork's first
// result comes first, so the script continues in its view and runs the second `await` there. Then the real
// batch's first result comes, and the fork is discarded — before its second result is in. The real batch must
// run the second `await` itself and continue with it, rather than the script continuing without a value
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, show, discard, a0, a1, ba0, ba1] = target.querySelectorAll('button');

		for (const button of [fork, show, a1, a0, discard]) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, buttons);
		}

		ba0.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>a0 ba0</p>`);

		ba1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>a0 ba0</p>`);
	}
});
