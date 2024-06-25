import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button><button>2</button><button>3</button><button>4</button>\n-------`
		);

		const [b1] = target.querySelectorAll('button');

		b1.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`<button>2</button><button>3</button><button>4</button>\n-------\n<button>1</button>`
		);
	}
});
