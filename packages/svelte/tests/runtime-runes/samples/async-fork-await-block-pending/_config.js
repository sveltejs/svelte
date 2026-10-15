import { tick } from 'svelte';
import { test } from '../../test';

// The pending state of a fork's {#await} promise, and its result, must not show in the real world unless
// the fork is committed. Real updates must keep working while a fork is alive, and a promise of the real
// world must still resolve in the real world when a fork re-runs the block
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');
		const [set_a, set_b, fork, discard, commit, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		const set_a_with = (/** @type {number} */ n) => {
			input.value = String(n);
			set_a.click();
		};

		const set_b_with = (/** @type {number} */ n) => {
			input.value = String(n);
			set_b.click();
		};

		const fork_with = (/** @type {number} */ n) => {
			input.value = String(n);
			fork.click();
		};

		const resolve_with = (/** @type {number} */ n) => {
			input.value = String(n);
			resolve.click();
		};

		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(0);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// pending and resolved in the fork, then discarded
		fork_with(1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		resolve_with(1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// rejected in the fork, then discarded
		fork_with(-1);
		resolve_with(-1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// For comparison, a real update: pending, then resolved
		set_b_with(2);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(2);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>2</q>');

		// committed while pending: shows the pending state, just like a real update would
		fork_with(3);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>2</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(3);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>3</q>');

		// a real update while the fork is pending (a + b: real 4 + 3, fork 4 + 10)
		fork_with(10);
		await tick();
		set_a_with(4);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(14);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(7);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>7</q>');
		resolve_with(10); // the fork's obsolete promise (from before it saw a = 4)
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>7</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>14</q>');

		// a real update while the fork is pending, then discarded (real 5 + 10, fork 5 + 20)
		fork_with(20);
		await tick();
		set_a_with(5);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(15);
		resolve_with(25);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>15</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>15</q>');
		resolve_with(24);

		// a real promise that is still pending when a fork re-runs the block must resolve in the real world
		set_a_with(6);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		fork_with(30);
		await tick();
		resolve_with(16);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>16</q>');
		discard.click();
		resolve_with(36);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>16</q>');

		// ...also when the fork's promise resolves first, and the fork is committed afterwards
		set_a_with(7);
		await tick();
		fork_with(40);
		resolve_with(47);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(17);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>17</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>47</q>');

		// ...but once the fork is committed, the real world's older promise is obsolete
		set_a_with(8);
		await tick();
		fork_with(50);
		await tick();
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(48);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		resolve_with(58);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>58</q>');

		// rejected in the fork, then committed
		fork_with(-60);
		resolve_with(-52);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>58</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<s>-52</s>');
	}
});
