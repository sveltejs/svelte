import { writable } from '../../../../store.js';

export default {
	props: {
		count: writable(0)
	},

	html: `
		<button>double 0</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.htmlEqual(target.innerHTML, `
			<button>double 2</button>
		`);

		await component.count.set(42);

		assert.htmlEqual(target.innerHTML, `
			<button>double 84</button>
		`);
	}
};