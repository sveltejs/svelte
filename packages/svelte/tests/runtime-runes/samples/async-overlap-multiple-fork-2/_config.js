import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a_b_fork, a_c, b_d, shift, pop, commit] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		a_b_fork.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 0 | b 0 | c 0 | d 0');

		a_c.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 0 | b 0 | c 0 | d 0');

		b_d.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 0 | b 0 | c 0 | d 0');

		pop.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 0 | b 1 | c 0 | d 1');

		pop.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 1 | b 1 | c 1 | d 1');

		shift.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 1 | b 1 | c 1 | d 1');

		shift.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 1 | b 1 | c 1 | d 1');

		commit.click();
		await tick();
		assert.htmlEqual(p.innerHTML, 'a 1 | b 1 | c 1 | d 1');
	}
});
