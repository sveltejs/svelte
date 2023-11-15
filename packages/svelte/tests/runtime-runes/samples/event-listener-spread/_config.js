import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	async test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>clicks: 1</button>');
	}
});
