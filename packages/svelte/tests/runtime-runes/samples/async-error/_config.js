import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>step 1</button><button>step 2</button><button>step 3</button><p>pending</p>`,

	async test({ assert, target }) {
		let [button1, button2, button3] = target.querySelectorAll('button');

		button1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>oops!</p><button data-id="reset">reset</button>'
		);

		button2.click();

		const reset = /** @type {HTMLButtonElement} */ (target.querySelector('[data-id="reset"]'));
		reset.click();

		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>pending</p>'
		);

		button3.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><h1>wheee</h1>'
		);
	}
});
