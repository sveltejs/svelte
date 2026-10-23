import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a, c, shift, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		c.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		// Resolving `b = 2` makes the `a` batch run the `d` expression, which the `c` batch ran, too. So the
		// `c` batch intersects with it now (see `Batch#intersects`): when it's processed next, its view
		// includes the `a` batch's writes, and its result for `d` (`delay(1)`) is outdated and re-runs.
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 1 | b 2 | c 0 | d 2
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 1 | b 2 | c 1 | d 3
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);
	}
});
