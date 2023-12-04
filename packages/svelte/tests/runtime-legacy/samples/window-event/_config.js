import { test } from '../../test';

export default test({
	html: '<div>x</div>',

	async test({ assert, target, window }) {
		const event = new window.Event('resize');

		Object.defineProperties(window, {
			innerWidth: {
				value: 567,
				configurable: true
			},
			innerHeight: {
				value: 456,
				configurable: true
			}
		});

		await window.dispatchEvent(event);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>567x456</div>
		`
		);
	}
});
