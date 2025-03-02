import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// This test counts mutations on hydration
// set_style() should not mutate style on hydration, except if mismatch
export default test({
	mode: ['server', 'hydrate'],

	server_props: {
		browser: false
	},

	props: {
		browser: true
	},

	ssrHtml: `
		<main id="main" style="color: black;">
			<div style="color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="background:blue; background: linear-gradient(0, white 0%, red 100%); color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="background: url(https://placehold.co/100x100?text=;&font=roboto); color: red; font-size: 18px !important;"></div>
			<div style="background: url(&quot;https://placehold.co/100x100?text=;&font=roboto&quot;); color: red; font-size: 18px !important;"></div>
			<div style="background: url('https://placehold.co/100x100?text=;&font=roboto'); color: red; font-size: 18px !important;"></div>
		</main>
	`,

	html: `
		<main id="main" style="color: white;">
			<div style="color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="background:blue; background: linear-gradient(0, white 0%, red 100%); color: red; font-size: 18px !important;"></div>
			<div style="border: 1px solid; color: red; font-size: 18px !important;"></div>
			<div style="background: url(https://placehold.co/100x100?text=;&font=roboto); color: red; font-size: 18px !important;"></div>
			<div style="background: url(&quot;https://placehold.co/100x100?text=;&font=roboto&quot;); color: red; font-size: 18px !important;"></div>
			<div style="background: url('https://placehold.co/100x100?text=;&font=roboto'); color: red; font-size: 18px !important;"></div>
		</main>
	`,

	async test({ target, assert, component, instance }) {
		flushSync();
		tick();
		assert.deepEqual(instance.get_and_clear_mutations(), ['MAIN']);

		let divs = target.querySelectorAll('div');

		// Note : we cannot compare HTML because set_style() use dom.style.cssText
		// which can alter the format of the attribute...

		divs.forEach((d) => assert.equal(d.style.margin, ''));
		divs.forEach((d) => assert.equal(d.style.color, 'red'));
		divs.forEach((d) => assert.equal(d.style.fontSize, '18px'));

		component.margin = '1px';
		flushSync();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV'],
			'margin'
		);
		divs.forEach((d) => assert.equal(d.style.margin, '1px'));

		component.color = 'yellow';
		flushSync();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV'],
			'color'
		);
		divs.forEach((d) => assert.equal(d.style.color, 'yellow'));

		component.fontSize = '10px';
		flushSync();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV'],
			'fontSize'
		);
		divs.forEach((d) => assert.equal(d.style.fontSize, '10px'));

		component.fontSize = null;
		flushSync();
		assert.deepEqual(
			instance.get_and_clear_mutations(),
			['DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV', 'DIV'],
			'fontSize'
		);
		divs.forEach((d) => assert.equal(d.style.fontSize, ''));
	}
});
