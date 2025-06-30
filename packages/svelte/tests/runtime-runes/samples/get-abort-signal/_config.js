import { test } from '../../test';

export default test({
	html: `<button>increment</button><p>loading...</p>`,

	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		await new Promise((f) => setTimeout(f, 50)); // TODO replace with `tick` once `await` lands
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>0</p>');

		button.click();
		await new Promise((f) => setTimeout(f, 50)); // TODO replace with `tick` once `await` lands
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>2</p>');
	}
});
