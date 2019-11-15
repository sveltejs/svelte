export default {
	skip_if_ssr: true,
	before_test() {
		Object.defineProperties(window, {
			pageYOffset: {
				value: 0,
				configurable: true,
			},
		});
	},
	async test({ assert, component, target, window }) {
		assert.equal(window.pageYOffset, 0);

		const event = new window.Event('scroll');
		Object.defineProperties(window, {
			pageYOffset: {
				value: 234,
				configurable: true,
			},
		});

		await window.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`<p style="position: fixed; top: 1em; left: 1em;">scroll\ny\nis\n234.\n234\n*\n234\n=\n54756</p><div style="height: 9999px;"></div>`
		);
	},
};
