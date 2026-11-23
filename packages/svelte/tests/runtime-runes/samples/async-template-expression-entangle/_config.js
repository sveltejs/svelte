import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>a</button><button>b</button><button>shift</button>';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a, b, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>0</p><p>0</p>${buttons}`);

		// batch A writes `a` and pends on its async expression
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p><p>0</p>${buttons}`);

		// batch B writes `b` — it only shares the `{add(a, b)}` template expression
		// (a leaf) with batch A, so the two are independent: B commits right away,
		// rendering its own view of the world (in which `a` is still 0)
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p><p>1</p>${buttons}`);

		// the async expression settles — A commits and brings the shared
		// template expression up to date
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>1</p><p>2</p>${buttons}`);
	}
});
