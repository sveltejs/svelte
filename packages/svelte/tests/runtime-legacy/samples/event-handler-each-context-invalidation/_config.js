import { test } from '../../test';

export default test({
	html: `
		<button>off</button>
		<button>on</button>
		<button>off</button>
		<p>on: 1</p>
	`,

	async test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		await buttons[0].dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>on</button>
			<button>on</button>
			<button>off</button>
			<p>on: 2</p>
		`
		);

		await buttons[2].dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>on</button>
			<button>on</button>
			<button>on</button>
			<p>on: 3</p>
		`
		);

		assert.deepEqual(component.switches, [{ on: true }, { on: true }, { on: true }]);
	}
});
