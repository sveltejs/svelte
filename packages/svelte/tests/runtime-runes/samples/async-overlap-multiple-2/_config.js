import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO works on https://github.com/sveltejs/svelte/pull/17971
	async test({ assert, target }) {
		await tick();
		const [a_b, a_c, b_d, shift, pop] = target.querySelectorAll('button');

		a_b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a and b</button>
			<button>a and c</button>
			<button>b and d</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		a_c.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a and b</button>
			<button>a and c</button>
			<button>b and d</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		b_d.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a and b</button>
			<button>a and c</button>
			<button>b and d</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		pop.click(); // second b resolved, blocked on first batch because a still pending
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 0 | b 0 | c 0 | d 0
			<button>a and b</button>
			<button>a and c</button>
			<button>b and d</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		for (let i = 0; i < 3; i++) {
			pop.click(); // second a resolved, first a/b now obsolete; empty queue
			await tick();
			assert.htmlEqual(
				target.innerHTML,
				`
				a 2 | b 2 | c 1 | d 1
				<button>a and b</button>
				<button>a and c</button>
				<button>b and d</button>
				<button>shift</button>
				<button>pop</button>
			`
			);
		}
	}
});
