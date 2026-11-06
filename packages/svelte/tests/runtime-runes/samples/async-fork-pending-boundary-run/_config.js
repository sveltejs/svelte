import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>show</button>
	<button>fork</button>
	<button>shift</button>
	<button>commit</button>
`;

// A fork's run of an async expression inside a pending boundary doesn't supersede the run of a real batch:
// the fork's result isn't part of the real world until it's committed
export default test({
	async test({ assert, target }) {
		const [show, fork, shift, commit] = target.querySelectorAll('button');

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading</p>`);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading</p>`);

		// resolve the real batch's run, then the fork's
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>1</p>`);
	}
});
