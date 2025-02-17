import { flushSync } from 'svelte';
import { test } from '../../test';

const style_1 = 'invalid-key:0; margin:4px;;color: green ;color:blue ';
const style_2 = ' other-key : 0 ; padding:2px; COLOR:green; color: blue';

// https://github.com/sveltejs/svelte/issues/15309
export default test({
	props: {
		style: style_1
	},

	html: `
		<div style="${style_1}"></div>
		<div style="${style_1}"></div>

		<custom-element style="${style_1}"></custom-element>
		<custom-element style="${style_1}"></custom-element>
	`,

	async test({ assert, target, component }) {
		component.style = style_2;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div style="${style_2}"></div>
			<div style="${style_2}"></div>

			<custom-element style="${style_2}"></custom-element>
			<custom-element style="${style_2}"></custom-element>
			`
		);
	}
});
