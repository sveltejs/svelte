import { tick } from 'svelte';
import { test } from '../../test';

export default test({
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

		shift.click();
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

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 1 | b 1 | c 0 | d 0
			<button>a and b</button>
			<button>a and c</button>
			<button>b and d</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			a 2 | b 1 | c 1 | d 0
			<button>a and b</button>
			<button>a and c</button>
			<button>b and d</button>
			<button>shift</button>
			<button>pop</button>
		`
		);

		shift.click();
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
});
