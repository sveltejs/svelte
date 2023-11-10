import { ok, test } from '../../test';
import { writable } from 'svelte/store';

let count = writable(0);

export default test({
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
		ok(button);
		const click = new window.MouseEvent('click', { bubbles: true });

		await button.dispatchEvent(click);
		assert.equal(component.get_count(), 1);

		await count.set(42);
		assert.equal(component.get_count(), 42);
	}
});
