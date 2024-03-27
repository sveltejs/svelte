import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	html: '<button>10</button>',

	async test({ assert, target, window }) {
		const event = new window.MouseEvent('click');

		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, '<button>11</button>');
	}
});
