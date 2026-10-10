import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [forkButton, real, shift, discard] = target.querySelectorAll('button');

		assert.deepEqual(logs, ['b 0']);
		logs.length = 0;

		// speculative world: fork writes b and c, runs the async expression
		forkButton.click();
		await tick();
		assert.deepEqual(logs, ['b 1']);

		// real world: b++ re-runs the async expression for real
		real.click();
		await tick();
		assert.deepEqual(logs, ['b 1', 'b 1']);

		// resolve the fork's in-flight run — the fork is still speculative,
		// nothing should be committed or re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['b 1', 'b 1']);

		// resolve the real run — the real batch commits b = 1. The fork's world
		// value of `b` is also 1 (its own write, now also committed), so the
		// fork's async expression sees unchanged inputs and should not re-run
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>1 0</p><button>fork</button><button>real</button><button>shift</button><button>discard</button>'
		);
		assert.deepEqual(logs, ['b 1', 'b 1']);

		discard.click();
		await tick();
	}
});
