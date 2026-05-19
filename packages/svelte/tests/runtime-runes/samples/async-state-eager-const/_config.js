import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true }, // for testing that teardown effect in eager $.get(loaded) doesn't lead to a crash (because it means REACTION_RAN is set, which means unfreeze_derived runs)
	async test({ assert, target }) {
		const [count, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>0</button><button>shift</button><p>0</p>`);

		count.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>shift</button><p>0 (...)</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>shift</button><p>1</p>`);
	}
});
