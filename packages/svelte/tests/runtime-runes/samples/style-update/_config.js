import { flushSync } from 'svelte';
import { test } from '../../test';

const style_1 = 'invalid-key:0; margin:4px;;color: green ;color:blue ';
const style_2 = ' other-key : 0 ; padding:2px; COLOR:green; color: blue';
const style_2_normalized = 'padding: 2px; color: blue;';

// https://github.com/sveltejs/svelte/issues/15309
export default test({
	props: {
		style: style_1
	},

	ssrHtml: `
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
			<div style="${style_2_normalized}"></div>
			<div style="${style_2_normalized}"></div>

			<custom-element style="${style_2_normalized}"></custom-element>
			<custom-element style="${style_2_normalized}"></custom-element>
			`
		);

		component.style = '';
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div style=""></div>
			<div style=""></div>

			<custom-element style=""></custom-element>
			<custom-element style=""></custom-element>
			`
		);

		component.style = null;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div></div>
			<div></div>

			<custom-element></custom-element>
			<custom-element></custom-element>
			`
		);
	}
});
