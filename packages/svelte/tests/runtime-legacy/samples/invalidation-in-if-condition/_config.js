import { ok, test } from '../../test';

export default test({
	html: '<button>false 0</button>',

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const click = new window.MouseEvent('click', { bubbles: true });

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, '<button>true 1</button>');

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, '<button>false 1</button>');

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, '<button>true 2</button>');
	}
});
