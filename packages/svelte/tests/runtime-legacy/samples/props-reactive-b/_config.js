import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { a: 1, b: 2 };
	},

	html: `
		<p>a: 1</p>
		<p>b: 2</p>
		<p>c: 3</p>
	`,

	test({ assert, component, target }) {
		component.$set({ a: 4 });
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 4</p>
			<p>b: 2</p>
			<p>c: 6</p>
		`
		);

		component.$set({ b: 5 });
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 4</p>
			<p>b: 5</p>
			<p>c: 9</p>
		`
		);
	}
});
