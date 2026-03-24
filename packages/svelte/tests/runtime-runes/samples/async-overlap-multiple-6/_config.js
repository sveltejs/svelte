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

		// Although the second batch is eventually connected to the first one, we can't see that
		// at this point yet and so the second one flushes right away.
		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 1 | d 1
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 1 | d 1
			<button>a++</button>
			<button>c++</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		pop.click();
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
