import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>a</button><button>b</button><button>shift</button>';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a, b, shift] = target.querySelectorAll('button');

		// batch A waits on its key; batch B registers its key right away
		a.click();
		await tick();
		b.click();
		await tick();

		// the older batch commits first
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p><p>1</p>${buttons}`);

		// the newer batch commits with its own branch
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>1</p><p>B</p>${buttons}`);
	}
});
