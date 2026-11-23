import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>top 2</button><button>toggle</button><button>2</button><p>4 total</p><div><span>nested</span></div><div><span>nested</span></div>`,
	async test({ assert, target }) {
		const [top, toggle, increment] = target.querySelectorAll('button');

		top.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>top 4</button><button>toggle</button><button>2</button><p>4 total</p><div><span>nested</span></div><div><span>nested</span></div>`
		);

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>top 4</button><button>toggle</button><button>3</button><p>6 total</p><div><span>nested</span></div><div><span>nested</span></div>`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>top 4</button><button>toggle</button><div><span>nested</span></div>`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>top 4</button><button>toggle</button><button>2</button><p>4 total</p><div><span>nested</span></div><div><span>nested</span></div>`
		);
	}
});
