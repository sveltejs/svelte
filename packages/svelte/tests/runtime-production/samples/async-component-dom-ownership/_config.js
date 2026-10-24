import { settled } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, target }) {
		// Allow the initially pending implicit boundary to finish rendering.
		await new Promise((resolve) => setTimeout(resolve, 0));
		await settled();

		const [home, other, next] = target.querySelectorAll('button');
		const buttons = '<button>home</button><button>other</button><button>next</button>';
		// Exercise both blockers and template expressions, including a multi-node child.
		const children =
			'<p id="child">child (ready)</p><header>expression (ready)</header><footer>footer</footer>';
		const other_pages = '<p>other</p><p>other expression</p>';
		const next_pages = '<p>next</p><p>next expression</p>';

		assert.htmlEqual(target.innerHTML, buttons + children);

		other.click();
		await settled();
		assert.htmlEqual(target.innerHTML, buttons + other_pages);

		home.click();
		await settled();
		assert.htmlEqual(target.innerHTML, buttons + children);

		next.click();
		await settled();
		assert.htmlEqual(target.innerHTML, buttons + next_pages);

		home.click();
		await settled();
		assert.htmlEqual(target.innerHTML, buttons + children);

		next.click();
		await settled();
		assert.htmlEqual(target.innerHTML, buttons + next_pages);
	}
});
