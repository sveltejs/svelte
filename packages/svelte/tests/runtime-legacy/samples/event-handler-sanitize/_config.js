import { ok, test } from '../../test';

export default test({
	html: `
		<div>toggle</div>
	`,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		ok(div);
		const event = new window.MouseEvent('some-event');

		await div.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>toggle</div>
			<p>hello!</p>
		`
		);

		await div.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>toggle</div>
		`
		);
	}
});
