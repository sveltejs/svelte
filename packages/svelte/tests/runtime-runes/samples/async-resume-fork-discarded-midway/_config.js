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

// A real batch adopts a component created by a fork. The fork's first result resumes the script,
// starting a second await. The real batch must run it in its own view and continue with its own result,
// even if the fork is discarded while its second await is pending.
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
