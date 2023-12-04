import { test } from '../../test';

export default test({
	html: `
  <button>Add entry</button>
  <p>x</p>
`,

	async test({ assert, target, window }) {
		const clickEvent = new window.Event('click', { bubbles: true });

		await target.querySelector('button')?.dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
    <button>Add entry</button>
    <p>x</p>
    <p>y</p>
    <button>Remove entry</button>
    `
		);

		await target.querySelectorAll('button')[1].dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
    <button>Add entry</button>
    <p>x</p>
    `
		);
	}
});
