import { test } from '../../test';

export default test({
	html: `
		<button>1</button>
		<button>double</button>
	`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		await btn1?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>2</button>
				<button>double</button>
			`
		);

		await btn2?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>4</button>
				<button>double</button>
			`
		);

		await btn1?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>5</button>
				<button>double</button>
			`
		);
	}
});
