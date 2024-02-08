import { test } from '../../test';

export default test({
	html: `<button>click</button><button>click</button><button>click</button>`,

	async test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		await btn1.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`<button>click</button><button>click</button><button>click</button>`
		);
	}
});
