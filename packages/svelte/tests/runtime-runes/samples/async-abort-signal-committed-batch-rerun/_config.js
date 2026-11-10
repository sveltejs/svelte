import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>w++</button>
	<button>x++</button>
	<button>show</button>
	<button>c++</button>
	<button>resolve 0,1,1</button>
`;

// A batch that committed while work inside a pending boundary was in flight stays linked. When another batch's commit
// rebases it, its view can run a derived again that an earlier batch runs again, too. Its run mustn't supersede (and
// abort) the earlier batch's: that one saw its writes, but not the other way around.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [inc_w, inc_x, show, inc_c, resolve] = target.querySelectorAll('button');

		/**
		 * @param {HTMLElement} button
		 * @param {string} content
		 */
		async function step(button, content) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}${content}`);
			return logs.splice(0);
		}

		// W: stays pending, so that A's view (which undoes `w`) runs `d` as a run of its own
		assert.deepEqual(await step(inc_w, '<i>0</i>'), []);

		// A: awaits its run of `d`
		assert.deepEqual(await step(inc_x, '<i>0</i>'), ['load 0,1,0']);

		// B: shows a boundary whose content never resolves, so B commits while it's pending, and stays linked
		assert.deepEqual(await step(show, '<i>0</i><b>pending</b>'), [
			'aborted 0,1,0',
			'load 0,0,0',
			'load 1,0,0'
		]);

		// C commits, which rebases A and B, and both run `d` again: B's run mustn't abort A's new one
		const runs = await step(inc_c, '<i>0</i><b>pending</b>');
		assert.ok(runs.includes('load 0,1,1'));
		assert.ok(!runs.includes('aborted 0,1,1'));

		// A's run resolves, and A commits (which drops its run of `d`). W runs `d` again, as A's commit rebases it
		assert.deepEqual(await step(resolve, '<i>0</i><p>0,1,1</p><b>pending</b>'), [
			'aborted 0,1,1',
			'load 1,1,1'
		]);
	}
});
