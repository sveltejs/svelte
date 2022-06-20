import { writable } from '../../../../store';

const c = writable(0);

export default {
	props: {
		c
	},

	html: `
		<p>a: 0</p>
		<p>b: 0</p>
		<p>c: 0</p>

		<button>+1</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.htmlEqual(target.innerHTML, `
			<p>a: 1</p>
			<p>b: 1</p>
			<p>c: 1</p>

			<button>+1</button>
		`);

		await component.c.set(42);

		assert.htmlEqual(target.innerHTML, `
			<p>a: 42</p>
			<p>b: 42</p>
			<p>c: 42</p>

			<button>+1</button>
		`);
	}
};
