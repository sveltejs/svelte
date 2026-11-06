import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>update</button>
	<button>resolve assessment 2</button>
	<button>resolve schedule 2</button>
	<button>resolve assessment 1</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		await tick();
		const [update, resolve_a_2, resolve_schedule_2, resolve_a_1, read] =
			target.querySelectorAll('button');
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>0/0</p><p>matched</p><button>read parity</button>`
		);
		assert.deepEqual(logs, [
			['assessment', 0],
			['schedule', 0],
			['parity', 0],
			['matched', 0, 0]
		]);
		logs.length = 0;

		update.click();
		await tick();
		update.click();
		await tick();

		// The dependency changes, but parity stays 0 and its write version stays
		// unchanged. Both if blocks must share one evaluation in this batch's view.
		resolve_a_2.click();
		await tick();
		assert.deepEqual(logs, [
			['assessment', 1],
			['assessment', 2],
			['schedule', 2],
			['parity', 2],
			['matched', 2, 0]
		]);
		logs.length = 0;

		// Resume the same batch and read parity again from the second if block.
		// Its dependencies have not changed since its previous evaluation.
		// In contrast, matched depends on schedule and must be invalidated.
		resolve_schedule_2.click();
		await tick();
		// Committing also merges into the earlier batch and flushes the text effect,
		// which must reuse the clean parity rather than evaluating it again.
		assert.deepEqual(logs, [['matched', 2, 2]]);
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>2/0</p><p>matched</p><button>read parity</button>`
		);
		logs.length = 0;

		// The superseded result must not cause any further evaluations.
		resolve_a_1.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>2/0</p><p>matched</p><button>read parity</button>`
		);

		// Once the competing batches are gone, parity must be globally clean.
		// An event-handler read has no batch-local status to fall back on.
		read.click();
		assert.deepEqual(logs, [['read', 0]]);
	}
});
