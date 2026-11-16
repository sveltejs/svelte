import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		const [
			fork,
			real,
			a_real,
			b_real,
			a_fork,
			b_fork,
			commit,
			adopted,
			update,
			a_update,
			b_update
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		real.click();
		await tick();
		a_fork.click();
		await tick();
		a_real.click();
		await tick();
		b_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0/0</p>');
		const [node] = output.querySelectorAll('p');
		b_fork.click();
		await tick();
		commit.click();
		await tick();
		// Adoption may invalidate a successful producer whose plain-local input
		// changes to the established snapshot. It must not retain the old closure.
		adopted.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1/0/1</p>');
		update.click();
		await tick();
		a_update.click();
		await tick();
		b_update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2/0/2</p>');
		assert.equal(output.querySelector('p'), node);
		assert.equal(
			logs.includes('b 3'),
			false,
			'producer must not retain the fork snapshot=1 closure'
		);
	}
});
