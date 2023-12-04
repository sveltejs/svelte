import { ok, test } from '../../test';

export default test({
	get props() {
		return { disabled: false };
	},
	html: '<button>Click me</button>',

	test({ assert, component, target }) {
		const button = target.querySelector('button');
		ok(button);

		assert.equal(button.disabled, false);

		component.disabled = true;
		assert.htmlEqual(target.innerHTML, '<button disabled>Click me</button>');
		assert.equal(button.disabled, true);
	}
});
