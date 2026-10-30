import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [a, t, shift_a, shift_t] = target.querySelectorAll('button');

		shift_a.click();
		shift_t.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>t</button>
				<button>shift a</button>
				<button>shift t</button>
				<p>async a: 0</p>
				<p>late read: -1</p>
			`
		);

		// batch A: writes `a`, stays pending (its promise is unresolved)
		a.click();
		await tick();

		// batch B: writes `t`; resolve its promise so the continuation
		// reads `a` for the first time while A is still pending. Batches are
		// independent: B's view doesn't include A's write, so the continuation
		// reads `a = 0`, and B commits on its own with a consistent world
		t.click();
		await tick();
		shift_t.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>t</button>
				<button>shift a</button>
				<button>shift t</button>
				<p>async a: 0</p>
				<p>late read: 0</p>
			`
		);

		// resolve A's promise. A isn't done yet: since B committed, the late read
		// depends on `t = 1` and on `a`, which A wrote, so it re-ran in A's view
		// and A waits for that run's promise
		shift_a.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>t</button>
				<button>shift a</button>
				<button>shift t</button>
				<p>async a: 0</p>
				<p>late read: 0</p>
			`
		);

		// resolve the late read's re-run in A: A commits
		shift_t.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>t</button>
				<button>shift a</button>
				<button>shift t</button>
				<p>async a: 1</p>
				<p>late read: 1</p>
			`
		);
	}
});
