import { writable } from '../../../../store';

export default {
	skip: true,

	props: {
		things: [
			writable('a'),
			writable('b'),
			writable('c')
		]
	},

	html: `
		<button>a</button>
		<button>b</button>
		<button>c</button>
	`,

	async test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		await buttons[1].dispatchEvent(click);

		assert.htmlEqual(target.innerHTML, `
			<button>a</button>
			<button>B</button>
			<button>c</button>
		`);

		await component.things[1].set('d');

		assert.htmlEqual(target.innerHTML, `
			<button>d</button>
			<button>B</button>
			<button>c</button>
		`);
	}
};