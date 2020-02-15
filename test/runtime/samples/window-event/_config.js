export default {
	html: `<div>undefinedxundefined</div>`,

	skip_if_ssr: true, // there's some kind of weird bug with this test... it compiles with the wrong require.extensions hook for some bizarre reason

	async test({ assert, component, target, window }) {
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

		assert.htmlEqual(target.innerHTML, `
			<div>567x456</div>
		`);
	}
};