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

// A fork creates a component with two `await`s in its script, and a real batch adopts it. The fork's first
// result resumes the script and creates the second expression in the fork's view. The real batch must run
// that new expression in its own view too. Discarding the fork before its second result arrives must not
// keep the real batch from continuing with its own result.
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
