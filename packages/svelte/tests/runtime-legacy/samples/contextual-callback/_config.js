import { test } from '../../test';

export default test({
	html: '<button>click me</button>',

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		await button?.dispatchEvent(click);

		assert.equal(component.clicked, 'x');
	}
});
