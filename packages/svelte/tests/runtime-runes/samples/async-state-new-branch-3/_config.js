import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();

		y.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<hr>
		`
		);

		resolve.click();
		await tick();
		// the new branch's async expression read `x`, which the pending batch had
		// written, as a new dependency — the two batches entangled, so even though
		// the new branch's own async work has completed, it is held back until the
		// first branch's async work completes too
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<hr>
		`
		);

		resolve.click();
		await tick();
		// both branches commit together, fully consistent
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			universe
			universe
			"universe"
			universe
			universe
			universe
			"universe"
			<hr>
			universe
			"universe"
			universe
			universe
			universe
			"universe"
		`
		);
	}
});
