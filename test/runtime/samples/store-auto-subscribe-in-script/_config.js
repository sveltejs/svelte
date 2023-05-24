import { writable } from 'svelte/store';

let count = writable(0);

export default {
	get props() {
		count = writable(0);
		return { count };
	},

	html: `
		<button>+1</button>
	`,

	async test({ assert, component, target, window }) {
		assert.equal(component.get_count(), 0);

		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);
		assert.equal(component.get_count(), 1);

		await count.set(42);
		assert.equal(component.get_count(), 42);
	}
};
