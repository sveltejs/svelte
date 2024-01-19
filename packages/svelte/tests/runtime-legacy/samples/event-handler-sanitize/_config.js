import { ok, test } from '../../test';

export default test({
	html: `
		<div>toggle</div>
		<button>toggle</button>
	`,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		const button = target.querySelector('button');
		ok(div);
		ok(button);
		const event = new window.MouseEvent('some-event');

		await div.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>toggle</div>
			<button>toggle</button>
			<p>hello!</p>
		`
		);

		await button.click();
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>toggle</div>
			<button>toggle</button>
		`
		);
	}
});
