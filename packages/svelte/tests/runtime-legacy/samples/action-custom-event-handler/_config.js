import { ok, test } from '../../test';

export default test({
	html: '<button>0, 0</button>',

	async test({ assert, target, window }) {
		const event = new window.MouseEvent('click', {
			clientX: 42,
			clientY: 42
		});

		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, '<button>42, 42</button>');
	}
});
