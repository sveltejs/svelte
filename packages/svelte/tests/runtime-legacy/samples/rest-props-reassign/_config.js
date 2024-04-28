import { test } from '../../test';

export default test({
	html: `
		<button>increment</button>
		<p>0 c</p>
		<button>update</button>
	`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		await btn1.click();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>increment</button>
			<p>1 c</p>
			<button>update</button>
		`
		);

		await btn2.click();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>increment</button>
			<p>1 b c</p>
			<button>update</button>
		`
		);
	}
});
