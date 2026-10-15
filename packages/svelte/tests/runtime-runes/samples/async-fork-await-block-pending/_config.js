import { tick } from 'svelte';
import { test } from '../../test';

// The pending state of a fork's {#await} promise, and its result, must not show in the real world unless
// the fork is committed. Real updates must keep working while a fork is alive, and a promise of the real
// world must still resolve in the real world when a fork re-runs the block
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [
			fork_1,
			fork_negative_1,
			fork_3,
			fork_10,
			fork_20,
			fork_30,
			fork_40,
			fork_50,
			fork_negative_60,
			discard,
			commit,
			set_b_2,
			set_a_4,
			set_a_5,
			set_a_6,
			set_a_7,
			set_a_8,
			resolve_0,
			resolve_1,
			resolve_negative_1,
			resolve_2,
			resolve_3,
			resolve_14,
			resolve_7,
			resolve_10,
			resolve_15,
			resolve_25,
			resolve_24,
			resolve_16,
			resolve_36,
			resolve_47,
			resolve_17,
			resolve_48,
			resolve_58,
			resolve_negative_52
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// pending and resolved in the fork, then discarded
		fork_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		resolve_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// rejected in the fork, then discarded
		fork_negative_1.click();
		resolve_negative_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// For comparison, a real update: pending, then resolved
		set_b_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>2</q>');

		// committed while pending: shows the pending state, just like a real update would
		fork_3.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>2</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_3.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>3</q>');

		// a real update while the fork is pending (a + b: real 4 + 3, fork 4 + 10)
		fork_10.click();
		await tick();
		set_a_4.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_14.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_7.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>7</q>');
		resolve_10.click(); // the fork's obsolete promise (from before it saw a = 4)
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>7</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>14</q>');

		// a real update while the fork is pending, then discarded (real 5 + 10, fork 5 + 20)
		fork_20.click();
		await tick();
		set_a_5.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_15.click();
		resolve_25.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>15</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>15</q>');
		resolve_24.click();

		// a real promise that is still pending when a fork re-runs the block must resolve in the real world
		set_a_6.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		fork_30.click();
		await tick();
		resolve_16.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>16</q>');
		discard.click();
		resolve_36.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>16</q>');

		// ...also when the fork's promise resolves first, and the fork is committed afterwards
		set_a_7.click();
		await tick();
		fork_40.click();
		resolve_47.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_17.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>17</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>47</q>');

		// ...but once the fork is committed, the real world's older promise is obsolete
		set_a_8.click();
		await tick();
		fork_50.click();
		await tick();
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_48.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_58.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>58</q>');

		// rejected in the fork, then committed
		fork_negative_60.click();
		resolve_negative_52.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>58</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<s>-52</s>');
	}
});
