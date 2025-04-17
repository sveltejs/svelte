import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { a: 3, b: 4 };
	},

	html: `
		<p>a: 3</p>
		<p>b: 2</p>
	`,

	test({ assert, component, target }) {
		component.$set({
			a: 5,
			b: 6
		});
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 5</p>
			<p>b: 2</p>
		`
		);
	}
});
