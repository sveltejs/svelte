import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button><button>0</button>`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		await btn1.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>1</button><button>1</button>`);

		await btn3.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, `<button>1</button><button>1</button><button>0</button>`);

		await btn2.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, `<button>0</button><button>0</button><button>0</button>`);
	}
});
