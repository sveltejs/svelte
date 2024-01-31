import { test } from '../../test';

// Tests that readonly bails on setters/classes
export default test({
	html: `<button>clicks: 0</button><button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		await btn1.click();
		await btn2.click();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button><button>clicks: 1</button>`);

		await btn1.click();
		await btn2.click();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 2</button><button>clicks: 2</button>`);
	}
});
