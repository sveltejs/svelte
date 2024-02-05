import { test } from '../../test';

export default test({
	html: `
	<p>0 0 0 0</p>
	<button>0</button>
	<button>0</button>
	<button>0</button>
	<button>0</button>
	`,

	async test({ assert, target, component }) {
		const [b1, b2, b3, b4] = target.querySelectorAll('button');

		b1.click();
		b2.click();
		b3.click();
		b4.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
		<p>1 1 0 0</p>
		<button>1</button>
		<button>1</button>
		<button>1</button>
		<button>1</button>
		`
		);
	}
});
