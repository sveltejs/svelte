import { tick } from 'svelte';
import { test } from '../../test';

// The initializer changes an upstream async dependency while its downstream
// request remains pending. That SELFWRITE updates a/b, not the ordinary snapshot
// or initializer execution count. An external batch must instead get a fresh
// prefix and local state, never a mixture of old n/a/b and new input.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [
			initial_a,
			updated_a,
			update,
			replacement_initial_a,
			replacement_updated_a,
			replacement_b,
			obsolete
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		/** @param {string[]} required @param {string[]} optional */
		function expect_wave(required, optional = []) {
			const actual = logs.splice(0);
			for (const entry of actual) {
				assert.ok([...required, ...optional].includes(entry), `Unexpected work: ${entry}`);
			}
			for (const entry of required) {
				assert.equal(actual.filter((value) => value === entry).length, 1, entry);
			}
			for (const entry of optional) {
				assert.ok(actual.filter((value) => value === entry).length <= 1, entry);
			}
		}

		await tick();
		expect_wave(['before 0 0', 'load a 0']);
		assert.htmlEqual(output.innerHTML, 'pending');

		initial_a.click();
		await tick();
		// The downstream site may briefly start from the previous a value before
		// its replacement resolves. That is producer work, not another initializer.
		expect_wave(['write 0 0 1', 'load a 1'], ['load b 1']);
		assert.htmlEqual(output.innerHTML, 'pending');

		updated_a.click();
		await tick();
		expect_wave(['load b 2']);
		assert.htmlEqual(output.innerHTML, 'pending');

		await tick();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		assert.deepEqual(logs, [], 'self-write must not execute the increment again');

		// Leave b(2) pending. This external input update must reset the unfinished
		// local state to n=0 and rerun the whole prefix for an independent attempt.
		update.click();
		await tick();
		expect_wave(['before 10 0', 'load a 10']);
		assert.htmlEqual(output.innerHTML, 'pending');

		replacement_initial_a.click();
		await tick();
		expect_wave(['write 10 0 1', 'load a 11'], ['load b 11']);
		assert.htmlEqual(output.innerHTML, 'pending');

		replacement_updated_a.click();
		await tick();
		expect_wave(['load b 12']);
		assert.htmlEqual(output.innerHTML, 'pending');

		replacement_b.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '0 / 1 / 11 / 12');
		assert.deepEqual(logs, []);

		obsolete.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '0 / 1 / 11 / 12');
		assert.deepEqual(logs, [], 'obsolete results cannot continue or overwrite the fresh attempt');
	}
});
