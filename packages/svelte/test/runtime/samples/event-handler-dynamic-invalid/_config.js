export default {
	html: `<button>undef</button>
	<button>null</button>
	<button>invalid</button>`,

	async test({ assert, target, window }) {
		const [button_undef, button_null, button_invalid] = target.querySelectorAll('button');

		const event = new window.MouseEvent('click');
		let err = '';
		window.addEventListener('error', (e) => {
			e.preventDefault();
			err = e.message;
		});

		// All three should not throw if proper checking is done in runtime code
		await button_undef.dispatchEvent(event);
		assert.equal(err, '', err);

		await button_null.dispatchEvent(event);
		assert.equal(err, '', err);

		await button_invalid.dispatchEvent(event);
		assert.equal(err, '', err);
	}
};
