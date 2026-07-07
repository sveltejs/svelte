import { tick } from 'svelte';
import { test } from '../../test';

// Guards against 'definitely clean' state (the `CLEAN` flag / a too-new check
// version) leaking between batches: `sum` is affected by both the deferred
// batch (which changes `a`) and the quicker batch (which changes `b`).
// Consuming the invalidation in one batch/view must not prevent other views
// from recomputing `sum` with their own values
export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, shift, read] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>shift</button>
				<button>read</button>
				<p>10</p>
				<p>0</p>
			`
		);

		// batch A: changes `a`, is deferred while `delay(a)` is pending
		a.click();
		await tick();

		// batch B: changes `b`. It doesn't intersect with A, so it commits
		// independently with its own consistent view (a = 0, b = 20) —
		// `a`'s change is withheld until the async work is done
		b.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>shift</button>
				<button>read</button>
				<p>20</p>
				<p>0</p>
			`
		);

		// reading `sum` outside any batch sees the written-through values
		// of both batches — this read must not poison the state that batch A
		// relies on to recompute `sum` when it resumes
		read.click();
		assert.deepEqual(logs, [21]);

		// resolve batch A — `sum` must reflect both changes
		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>shift</button>
				<button>read</button>
				<p>21</p>
				<p>1</p>
			`
		);

		read.click();
		assert.deepEqual(logs, [21, 21]);
	}
});
