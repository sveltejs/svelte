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

		shift.click(); // schedules second step of first batch and schedules rerun of second batch
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

		// how it's on main

		pop.click();
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

		shift.click(); // obsolete second batch promise (already rejected)
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

		shift.click(); // first batch resolves
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

		// how it's on https://github.com/sveltejs/svelte/pull/17971
		// pop.click(); // second batch resolves but knows it needs to wait on first batch
		// await tick();
		// assert.htmlEqual(
		// 	target.innerHTML,
		// 	`
		// 	a 0 | b 0 | c 0 | d 0
		// 	<button>a++</button>
		// 	<button>c++</button>
		// 	<button>shift</button>
		// 	<button>pop</button>
		// `
		// );

		// shift.click(); // obsolete second batch promise (already rejected)
		// await tick();
		// assert.htmlEqual(
		// 	target.innerHTML,
		// 	`
		// 	a 0 | b 0 | c 0 | d 0
		// 	<button>a++</button>
		// 	<button>c++</button>
		// 	<button>shift</button>
		// 	<button>pop</button>
		// `
		// );

		// shift.click(); // first batch resolves, with it second can now resolve as well
		// await tick();
		// assert.htmlEqual(
		// 	target.innerHTML,
		// 	`
		// 	a 1 | b 2 | c 1 | d 3
		// 	<button>a++</button>
		// 	<button>c++</button>
		// 	<button>shift</button>
		// 	<button>pop</button>
		// `
		// );
	}
});
