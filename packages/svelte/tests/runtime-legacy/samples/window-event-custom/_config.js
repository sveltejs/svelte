import { test } from '../../test';

export default test({
	html: '<p>escaped: false</p>',

	async test({ assert, target, window }) {
		const event = new window.KeyboardEvent('keydown', {
			key: 'Escape'
		});

		await window.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>escaped: true</p>
		`
		);
	}
});
