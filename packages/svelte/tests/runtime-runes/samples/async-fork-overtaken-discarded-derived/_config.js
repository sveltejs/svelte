import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [fork, discard, real, shift, shift_second] = target.querySelectorAll('button');

		fork.click();
		await tick();
		shift.click();
		await tick();
		real.click();
		await tick();
		discard.click();
		await tick();
		shift.click(); // discarded run should be noop
		await tick();
		shift.click(); // rerun real
		await tick();
		shift.click(); // rerun real second
		await tick();
		assert.htmlEqual(target.querySelectorAll('output')[0].innerHTML, '4');
	}
});
