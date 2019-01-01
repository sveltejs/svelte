import { writable } from '../../../../store.js';

const count = writable(0);

export default {
	props: {
		count
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