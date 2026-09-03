import { tick } from 'svelte';
import { test } from '../../test';

// Regression test for https://github.com/sveltejs/svelte/issues/18761
// A state write that lands while a batch is being processed reaches
// Batch.ensure() while is_processing is true. The batch gets created but
// never scheduled because !is_processing && !is_flushing_sync guard skips
// queue_micro_task. When the flush exits through #find_earlier_batch()
// merge path, that pickup is skipped, and the batch stays unstarted forever.
//
// This test reproduces the bug with an action's update running during flush
// (different trigger than the flushSync inside render-phase effect in #18546).
//
// NOTE: This only reproduces without async mode (SVELTE_NO_ASYNC=true).
export default test({
	mode: ['client'],
	compileOptions: {
		dev: false
	},
	async test({ assert, target }) {
		const [grow1, grow2, change] = target.querySelectorAll('button');

		// Initial render
		assert.htmlEqual(
			target.innerHTML,
			'<button>grow1</button><button>grow2</button><button>change</button><div>columns: 1</div>'
		);

		// First growth step - creates some columns and measures them
		// During measurement, an action's update writes state mid-flush
		grow1?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>grow1</button><button>grow2</button><button>change</button><div>columns: 2</div>'
		);

		// Second growth step - this is where the bug manifests
		// The action's update during the first step may have created
		// an unscheduled batch that gets merged, and subsequent updates
		// may hit the "already dirty, bail" path
		grow2?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>grow1</button><button>grow2</button><button>change</button><div>columns: 3</div>'
		);

		// Change step - should update the columns
		change?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>grow1</button><button>grow2</button><button>change</button><div>columns: 4</div>'
		);
	}
});
