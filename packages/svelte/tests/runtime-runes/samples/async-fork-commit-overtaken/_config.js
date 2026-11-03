import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>x = 5</button>
	<button>commit</button>
	<button>shift</button>
`;

// A fork writes `x`, then the real world writes `x` as well (with async work still pending), and then the
// fork is committed. The real write comes after the fork's, so it stays the real-world value: the fork
// commits its own view once it's done, and the real batch commits its value after it, rather than losing it
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [fork, x5, commit, shift] = target.querySelectorAll('button');

		fork.click(); // speculative: delay(10)
		await tick();
		x5.click(); // real: delay(5)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		shift.click(); // the fork's committed delay(10)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>10</p>`);

		shift.click(); // the real delay(5)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>5</p>`);

		shift.click(); // (nothing else is queued)
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>5</p>`);
	}
});
