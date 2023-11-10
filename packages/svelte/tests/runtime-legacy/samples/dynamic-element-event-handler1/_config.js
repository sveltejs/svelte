import { test } from '../../test';

let clicked = false;
function handler() {
	clicked = true;
}

export default test({
	get props() {
		return { handler };
	},
	html: '<button>Foo</button>',

	before_test() {
		clicked = false;
	},

	test({ assert, target }) {
		assert.equal(clicked, false);

		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });
		button?.dispatchEvent(click);

		assert.equal(clicked, true);
	}
});
