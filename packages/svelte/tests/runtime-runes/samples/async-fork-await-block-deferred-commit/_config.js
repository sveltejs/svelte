import { tick } from 'svelte';
import { test } from '../../test';

// A fork that is committed while it still waits for other async work (here: `<p>`) is a pending real batch:
// its {#await} promise is the real world's promise from then on, and as long as the batch is pending,
// the promise's states land along with the rest of the fork's state. Once the batch is done, they
// are their own batches again, like for any real update
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');
		const [set_a, fork, commit, resolve_p, resolve_aw] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		const set_a_with = (/** @type {number} */ n) => {
			input.value = String(n);
			set_a.click();
		};

		const fork_with = (/** @type {number} */ n) => {
			input.value = String(n);
			fork.click();
		};

		const resolve_p_with = (/** @type {number} */ n) => {
			input.value = String(n);
			resolve_p.click();
		};

		const resolve_aw_with = (/** @type {number} */ n) => {
			input.value = String(n);
			resolve_aw.click();
		};

		resolve_p_with(0);
		await tick();
		resolve_aw_with(0);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><q>0</q>');

		// resolves before the batch is done; the real world's older promise is obsolete once the fork is committed
		set_a_with(1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><i>pending</i>');
		fork_with(10);
		await tick();
		commit.click();
		await tick();
		resolve_aw_with(11);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><i>pending</i>');
		resolve_aw_with(1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><i>pending</i>');
		resolve_p_with(10);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>10</p><q>11</q>');

		// resolves after the batch is done
		fork_with(20);
		await tick();
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>10</p><q>11</q>');
		resolve_p_with(20);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>20</p><i>pending</i>');
		resolve_aw_with(21);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>20</p><q>21</q>');

		// a real update after the commit supersedes the fork's promise
		fork_with(30);
		await tick();
		commit.click();
		await tick();
		set_a_with(2);
		await tick();
		resolve_aw_with(31);
		await tick();
		resolve_aw_with(32);
		await tick();
		resolve_p_with(30);
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>30</p><q>32</q>');
	}
});
