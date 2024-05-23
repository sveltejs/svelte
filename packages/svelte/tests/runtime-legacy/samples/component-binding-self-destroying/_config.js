import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { show: true };
	},

	html: `
		<button>Hide</button>
	`,

	test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });

		target.querySelector('button')?.dispatchEvent(click);
		flushSync();

		assert.equal(component.show, false);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
		`
		);

		target.querySelector('button')?.dispatchEvent(click);
		flushSync();

		assert.equal(component.show, true);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Hide</button>
		`
		);
	}
});
