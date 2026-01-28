import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<div></div>
		<div class="red svelte-p153w3"></div>
		<div></div>
		<div class="red svelte-p153w3"></div>
		<div class="blue svelte-p153w3"></div>
		<div class="blue svelte-p153w3"></div>
	`,

	async test({ assert, target, component }) {
		component.active = true;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div></div>
			<div class="red svelte-p153w3"></div>
			<div class="active"></div>
			<div class="red svelte-p153w3 active"></div>
			<div class="blue svelte-p153w3"></div>
			<div class="blue svelte-p153w3 active"></div>
		`
		);

		component.tag = 'span';
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span></span>
			<span class="red svelte-p153w3"></span>
			<span class="active"></span>
			<span class="red svelte-p153w3 active"></span>
			<span class="blue svelte-p153w3"></span>
			<span class="blue svelte-p153w3 active"></span>
		`
		);

		component.active = false;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span></span>
			<span class="red svelte-p153w3"></span>
			<span class=""></span>
			<span class="red svelte-p153w3"></span>
			<span class="blue svelte-p153w3"></span>
			<span class="blue svelte-p153w3"></span>
		`
		);
	}
});
