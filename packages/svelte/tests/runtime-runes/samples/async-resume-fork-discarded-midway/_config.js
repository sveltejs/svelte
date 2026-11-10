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
// result comes first, but the script continues in the view of the real batch, once its first result comes,
// and runs the second `await` there (the fork runs it in its own view, too). Then the fork is discarded, before
// its second result is in, which must not keep the real batch from continuing with its own
export default test({
	// batch-views: the rest of a script after a top-level `await` isn't created behind a gate like template
	// content is (see `flatten`): it continues once, in the view of the batch that created the component,
	// and only that batch waits for it. So the real batch commits the component before its content exists
	skip: true,
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
