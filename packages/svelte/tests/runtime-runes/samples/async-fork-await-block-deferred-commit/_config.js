import { tick } from 'svelte';
import { test } from '../../test';

// A fork that is committed while it still waits for other async work (here: `<p>`) is a pending real batch:
// its {#await} promise is the real world's promise from then on, and as long as the batch is pending,
// the promise's states land along with the rest of the fork's state. Once the batch is done, they
// are their own batches again, like for any real update
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [
			fork_10,
			fork_20,
			fork_30,
			commit,
			set_a_1,
			set_a_2,
			resolve_p_0,
			resolve_p_10,
			resolve_p_20,
			resolve_p_30,
			resolve_aw_0,
			resolve_aw_11,
			resolve_aw_1,
			resolve_aw_21,
			resolve_aw_31,
			resolve_aw_32
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		resolve_p_0.click();
		await tick();
		resolve_aw_0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><q>0</q>');

		// resolves before the batch is done; the real world's older promise is obsolete once the fork is committed
		set_a_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><i>pending</i>');
		fork_10.click();
		await tick();
		commit.click();
		await tick();
		resolve_aw_11.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><i>pending</i>');
		resolve_aw_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p><i>pending</i>');
		resolve_p_10.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>10</p><q>11</q>');

		// resolves after the batch is done
		fork_20.click();
		await tick();
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>10</p><q>11</q>');
		resolve_p_20.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>20</p><i>pending</i>');
		resolve_aw_21.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>20</p><q>21</q>');

		// a real update after the commit supersedes the fork's promise
		fork_30.click();
		await tick();
		commit.click();
		await tick();
		set_a_2.click();
		await tick();
		resolve_aw_31.click();
		await tick();
		resolve_aw_32.click();
		await tick();
		resolve_p_30.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>30</p><q>32</q>');
	}
});
