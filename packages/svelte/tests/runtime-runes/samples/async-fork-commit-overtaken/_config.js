import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>x = 5</button>
	<button>commit</button>
	<button>shift</button>
`;

// A fork writes `x`, then the real world writes `x` as well (with async work still pending).
// The fork's write is overtaken and it has nothing left to commit — `commit()` must resolve
// rather than throw `fork_discarded`, and the real world's value wins
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [fork, x5, commit, shift] = target.querySelectorAll('button');

		fork.click(); // speculative: delay(10)
		await tick();
		x5.click(); // real: delay(5); the fork adopts x = 5 and re-runs: delay(5)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		shift.click(); // the fork's obsolete delay(10)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		shift.click(); // the real delay(5)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>5</p>`);

		shift.click(); // the fork's delay(5), rejected when the fork was cleaned up
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>5</p>`);
	}
});
