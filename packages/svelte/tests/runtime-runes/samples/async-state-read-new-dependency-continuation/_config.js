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
		// reads `a` for the first time while A is still pending. This
		// entangles B with A — both worlds are held back and commit together
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
				<p>late read: -1</p>
			`
		);

		// commit the merged batch
		shift_a.click();
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
