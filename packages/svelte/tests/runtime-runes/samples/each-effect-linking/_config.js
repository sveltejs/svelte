import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [step_back, step_forward, jump_back, jump_forward] = target.querySelectorAll('button');
		const [div] = target.querySelectorAll('div');

		step_back.click();
		await tick();

		step_forward.click();
		await tick();

		step_forward.click();
		await tick();

		// if the effects get linked in a circle, we will never get here
		assert.htmlEqual(div.innerHTML, '<p>5</p><p>6</p><p>7</p>');

		jump_forward.click();
		await tick();

		step_forward.click();
		await tick();

		step_forward.click();
		await tick();

		assert.htmlEqual(div.innerHTML, '<p>12</p><p>13</p><p>14</p>');
	}
});
