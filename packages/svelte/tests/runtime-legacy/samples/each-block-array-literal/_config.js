import { ok, test } from '../../test';

export default test({
	html: `
		<button>racoon</button>
		<button>eagle</button>
	`,

	test({ assert, component, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>racoon</button>
			<button>eagle</button>
		`
		);

		const button = target.querySelector('button');
		ok(button);

		const event = new window.Event('click', { bubbles: true });

		button.dispatchEvent(event);
		assert.equal(component.clicked, 'racoon');
	}
});
