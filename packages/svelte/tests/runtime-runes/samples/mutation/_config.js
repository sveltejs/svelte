import { test } from '../../test';

export default test({
	html: `<button>1 / false</button>`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });

		await btn?.dispatchEvent(clickEvent);
		assert.htmlEqual(target.innerHTML, `<button>1 / true</button>`);

		await btn?.dispatchEvent(clickEvent);
		assert.htmlEqual(target.innerHTML, `<button>1 / false</button>`);
	}
});
