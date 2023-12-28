import { test } from '../../test';

export default test({
	html: `
		<button>Update</button>

		<p>0</p>
		<p>b</p>
		<p>true</p>
		<p>0</p>
		<p>10</p>
		<p>12</p>
		<p>15</p>
		<p>16</p>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		await button?.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Update</button>

			<p>5</p>
			<p>d</p>
			<p>false</p>
			<p>3</p>
			<p>100</p>
			<p>120</p>
			<p>25</p>
			<p>26</p>
			`
		);
	}
});
