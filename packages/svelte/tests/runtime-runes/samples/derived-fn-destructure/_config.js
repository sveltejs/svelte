import { test } from '../../test';

export default test({
	mode: ['server'],
	html: `<button>0</button>`,

	async test({ assert, target, window, logs }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		await btn?.dispatchEvent(clickEvent);

		assert.htmlEqual(target.innerHTML, `<button>2</button>`);
		assert.deepEqual(logs, ['create_derived']);
	}
});
