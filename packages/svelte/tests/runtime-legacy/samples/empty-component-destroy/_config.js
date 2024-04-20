import { test } from '../../test';

export default test({
	html: `
	  <button>destroy component</button>
	`,

	async test({ assert, target, window, logs }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		// @ts-ignore
		await button.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>destroy component</button>
		`
		);
		assert.deepEqual(logs, ['destroy']);
	}
});
