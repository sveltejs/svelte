import { test } from '../../test';

export default test({
	html: `<button>undef</button>
	<button>null</button>
	<button>invalid</button>`,

	async test({ assert, target, window }) {
		const [buttonUndef, buttonNull, buttonInvalid] = target.querySelectorAll('button');

		const event = new window.MouseEvent('click', { bubbles: true });
		let err = '';
		window.addEventListener('error', (e) => {
			e.preventDefault();
			err = e.message;
		});

		// All three should not throw if proper checking is done in runtime code
		await buttonUndef.dispatchEvent(event);
		assert.equal(err, '', err);

		await buttonNull.dispatchEvent(event);
		assert.equal(err, '', err);

		// TODO: Should this throw?
		// await buttonInvalid.dispatchEvent(event);
		// assert.equal(err, '', err);
	}
});
