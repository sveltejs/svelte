import { test } from '../../test';

export default test({
	html: `
  <p>1 4 0</p>
  <button>Shouldnt be reactive</button>
  `,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
  			<p>1 4 0</p>
  			<button>Shouldnt be reactive</button>
  			`
		);
	}
});
