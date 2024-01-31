import { test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<p>doubled: 0</p>
	`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<p>doubled: 2</p>
			`
		);

		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>2</button>
				<p>doubled: 4</p>
			`
		);
	}
});
