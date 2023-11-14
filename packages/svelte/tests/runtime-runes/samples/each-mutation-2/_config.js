import { test } from '../../test';

export default test({
	html: `<button>Click me and get error</button><button>Click me and get error</button><button>Click me and get error</button>`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		// ensure each click doesn't trigger an error
		await btn1.click();
		await Promise.resolve();

		await btn2.click();
		await Promise.resolve();

		await btn3.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`<button>Click me and get error</button><button>Click me and get error</button><button>Click me and get error</button>`
		);
	}
});
