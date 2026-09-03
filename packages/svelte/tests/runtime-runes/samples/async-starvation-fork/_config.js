import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, warnings }) {
		await tick();
		const [increment, forkButton, commit, resolve_sealed, resolve_latest] =
			target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		// restart the merged batch often enough that it becomes sealed
		// (MAX_ENTANGLED_RESTARTS) — subsequent work must wait behind it
		for (let i = 0; i < 11; i += 1) {
			increment.click();
			await tick();
		}

		assert.htmlEqual(p.innerHTML, '0:0');
		assert.equal(warnings.length, 0);

		// fork writes count in its own world and runs the async expression
		// with count = 111
		forkButton.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0:0');

		// committing the fork claims its validated effect, which is owned by
		// the sealed batch — the commit has to wait behind it
		commit.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0:0');
		assert.isTrue(warnings.length === 1 && warnings[0].includes('Your app is stuck in a loop'));

		// the sealed batch settles and commits its world (count = 11), then
		// releases the waiting fork-commit batch, which is still pending on
		// the fork's in-flight run (111)
		resolve_sealed.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '11:11');

		// resolving the fork's run commits the fork-committed world — the
		// two halves of the paragraph must not tear
		resolve_latest.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '111:111');
	}
});
