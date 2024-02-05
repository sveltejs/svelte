import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, 'a\n<select></select><button>change</button');

		const [b1] = target.querySelectorAll('button');
		b1.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			'a\n<select></select>b\n<select></select><button>change</button'
		);
	}
});
