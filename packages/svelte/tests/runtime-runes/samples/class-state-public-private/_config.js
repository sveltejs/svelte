import { test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<button>0</button>
	`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		await btn1?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>0</button>
			`
		);

		await btn2?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>1</button>
			`
		);
	}
});
