import { ok, test } from '../../test';

export default test({
	get props() {
		return { props: { disabled: true } };
	},

	html: `
		<button disabled>click me</button>
	`,

	test({ assert, component, target }) {
		const button = target.querySelector('button');
		ok(button);

		assert.ok(button.disabled);

		component.props = { disabled: false };

		assert.htmlEqual(target.innerHTML, '<button>click me</button>');
		assert.ok(!button.disabled);
	}
});
