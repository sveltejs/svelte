import { test } from '../../test';

// TODO err... what is going on here
export default test({
	html: '<button>click me</button>',

	get props() {
		return { foo: 42 };
	},

	test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');
		// @ts-expect-error wut
		const button = target.querySelector('button', { bubbles: true });

		let count = 0;
		let number = null;
	}
});
