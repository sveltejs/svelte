export default {
	html: `
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
		<h1 class="svelte-szzkfu">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
	`,

	ssrHtml: `
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red important;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red !important;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red !important;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red !important">hello</h1>
	`,

	test({ assert, target, window }) {
		const h1s = target.querySelectorAll('h1');

		assert.equal(window.getComputedStyle(h1s[0])['backgroundColor'], 'red');
		assert.equal(window.getComputedStyle(h1s[1])['backgroundColor'], 'blue');
		assert.equal(window.getComputedStyle(h1s[2])['backgroundColor'], 'red');
		assert.equal(window.getComputedStyle(h1s[3])['backgroundColor'], 'red');
		assert.equal(window.getComputedStyle(h1s[4])['backgroundColor'], 'red');
	}
};
