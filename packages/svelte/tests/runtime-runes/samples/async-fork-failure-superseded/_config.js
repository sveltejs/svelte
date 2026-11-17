import { tick } from 'svelte';
import { test } from '../../test';

// Unlike async-fork-failure-commit-cached, the real batch writes x=2. Once it
// commits, the earlier fork sees that newer dependency and its load(1) failure
// is replaced by a fresh load(2). That successful run may supersede the cached
// error; committing the fork must neither replay the error nor retry load(1).
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, reject_fork, resolve_2, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 1']);

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 2']);

		reject_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		// The real success commits x=2, so F must revalidate its old dependency.
		resolve_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), ['continued 2', 'load 2']);

		// Finish F's successful replacement before committing it. R is already
		// published, so the healthy fork adopts that initializer rather than running
		// its remaining imperative suffix. It must never retry failed load(1).
		resolve_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), []);

		commit.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
	}
});
