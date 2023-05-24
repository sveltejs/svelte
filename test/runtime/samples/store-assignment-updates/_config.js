import { writable } from 'svelte/store';

export default {
	get props() {
		return { count: writable(0) };
	},

	html: `
		<button>count 0</button>
		<p>doubled: 0</p>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>count 1</button>
			<p>doubled: 2</p>
		`
		);

		await component.count.set(42);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>count 42</button>
			<p>doubled: 84</p>
		`
		);
	}
};
