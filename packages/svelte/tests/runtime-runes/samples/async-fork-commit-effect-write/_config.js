import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `<button>fork</button><button>commit</button><button>shift</button>`;

// Committing a fork notifies the remaining forks about its writes. A real batch that was created
// while flushing the commit (here: by an effect writing to the same source) must not be treated
// like a fork (i.e. it must not be discarded as obsolete)
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [fork, commit, shift] = target.querySelectorAll('button');

		fork.click();
		await tick();
		shift.click(); // resolve the fork's delay(1)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		commit.click(); // commits x = 1, effect sets x = 2 -> delay(2)
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p>`);
	}
});
