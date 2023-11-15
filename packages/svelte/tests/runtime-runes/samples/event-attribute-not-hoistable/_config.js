import { test } from '../../test';

// Checks that event handlers are not hoisted when one of them is not delegateable
export default test({
	html: `<button>0</button>`,

	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>1</button>');

		button.dispatchEvent(new MouseEvent('mouseenter'));
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>2</button>');
	}
});
