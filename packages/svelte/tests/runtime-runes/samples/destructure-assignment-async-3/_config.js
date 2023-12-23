import { test } from '../../test';
import { setTimeout } from 'timers/promises';

export default test({
	html: `
    <button>Update me!</button>
    <p>5</p>
    <p>7</p>
    <p>9</p>
		<p>12</p>
  `,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		await btn?.dispatchEvent(clickEvent);

		await setTimeout(100);

		assert.htmlEqual(
			target.innerHTML,
			`
        <button>Update me!</button>
        <p>12</p>
        <p>19</p>
        <p>15</p>
        <p>7</p>
      `
		);
	}
});
