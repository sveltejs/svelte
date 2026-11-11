import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>w++</button>
	<button>x++</button>
	<button>show</button>
	<button>resolve content</button>
	<button>resolve 0,1</button>
`;

// A batch that committed while work inside a pending boundary was in flight stays linked, and comes first from
// then on. When that work resolves, its view can run a derived that a batch created before it holds a run of.
// Its run mustn't supersede (and abort) that batch's: that one saw its writes, but not the other way around.
// (The content reads `d` through a block, not an async expression: the other batches would re-run such an
// expression in their views, too, and then fold the committed batch (and each other) and be merged into it)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [inc_w, inc_x, show, resolve_content, resolve] = target.querySelectorAll('button');

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
		assert.deepEqual(await step(inc_x, '<i>0</i>'), ['load 0,1']);

		// B: shows a boundary whose content is pending, so B commits while it's pending, and stays linked.
		// Nothing reads `d` yet in B's view
		assert.deepEqual(await step(show, '<i>0</i><b>pending</b>'), []);

		// B's work resolves, and the content reads `d` in B's view (and then in W's, once B commits it).
		// B's run mustn't abort A's
		assert.deepEqual(await step(resolve_content, '<i>0</i><b>content</b>'), [
			'load 0,0',
			'load 1,0'
		]);

		// A's run resolves, and A commits (which drops its run of `d`). W runs `d` again, as A's commit rebases it
		assert.deepEqual(await step(resolve, '<i>0</i><p>0,1</p><b>content</b>'), [
			'aborted 0,1',
			'aborted 1,0',
			'load 1,1'
		]);
	}
});
